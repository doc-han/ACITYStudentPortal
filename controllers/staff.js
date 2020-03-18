const express = require('express');
const app = express.Router();
const rs = require('randomstring');
const program = require('../models/programModel');
const course = require('../models/courseModel');
const student = require('../models/studentModel');
const lecturer = require('../models/lecturerModel');
const semcourse = require('../models/semCoursesModel');
const {fee, paidfee} = require('../models/feeModel');
const config = require('../models/configModel');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const upload = require('../config/upload');
const fs = require('fs');
const nodeXLS = require('node-xlsx');

app.get('/', (req,res)=>{
	let bins = {registration: false, result: false};
	config.find({}).then(resp=>{
		if(resp){
			resp.forEach(i=>{
				bins[i.metaname] = i.metaval;
			})
		}
		res.render('staff/home', {bins});
	})
})

app.get('/studentsearch',(req,res)=>{
	res.render('staff/studentsearch');
})

app.get('/programs', (req,res)=>{
	program.find({}).then(data=>{
		res.render('staff/programs', {data});
	})
})
app.post('/programs', (req,res)=>{
	// add new program
	req.body.code = req.body.code.toUpperCase();
	let nProgram = new program(req.body);
	nProgram.save().then(sdata=>{
		new fee({
			program: nProgram._id,
			continuous: false,
			amount: 0
		}).save();
		new fee({
			program: nProgram._id,
			continuous: true,
			amount: 0
		}).save();
		res.redirect('/staff/programs');
	});
	
})

app.get('/courses', (req,res)=>{
	course.find({}).then(data=>{
		res.render('staff/courses', {data});
	})
})
app.post('/courses', (req,res)=>{
	// add new program
	let nCourses = new course(req.body);
	nCourses.save();
	res.redirect('/staff/courses');
})

app.get('/students', (req,res)=>{
	program.find({}).then(pdata=>{
		student.find({}).populate("program").then(data=>{
			//console.log(data)
			let id = Math.floor(Math.random()*10000000);
			let pass = (rs.generate(7)).toLowerCase();
			
			res.render('staff/students', {data, pdata, pd: {id, pass}});
		})
	})
	
})
app.post('/students', upload.single('pic'), (req,res)=>{
	// add new student
	
	
	cloudinary.uploader.upload(req.file.path,(err,result)=>{
		if(err) throw err;
		req.body.profilePic = result.public_id;
		let nStudent = new student(req.body);
		nStudent.save();
		res.redirect('/staff/students');
	})
	
})

app.get('/lecturers', (req,res)=>{
		lecturer.find({}).then(data=>{
			let id = Math.floor(Math.random()*10000000);
			let pass = (rs.generate(7)).toLowerCase();
			res.render('staff/lecturers', {data, pd: {id, pass}});
		})
	
})
app.post('/lecturers', upload.single('pic'), (req,res)=>{
	// add new student
	cloudinary.uploader.upload(req.file.path, (err,result)=>{
		if(err)throw err;
		req.body.profilePic = result.public_id;
		let nLecturer = new lecturer(req.body);
		nLecturer.save();
		res.redirect('/staff/lecturers');
	})
	
})

// takes query program code and year
app.get('/semcourses', (req,res)=>{
	let {code, year} = req.query;
	course.find({}).then(cdata=>{
		lecturer.find({}).then(ldata=>{
			program.findOne({code}).then(data=>{
				semcourse.find({programID: data._id, year, semester: 1}).populate("course").populate("lecturer").then(sem1res=>{
					semcourse.find({programID: data._id, year, semester: 2}).populate("course").populate("lecturer").then(sem2res=>{
						console.log(sem1res);
						res.render('staff/semcourses', {data,code,year,cdata,ldata,sem1res, sem2res});
					})
				})
			})
		})
	})
	
})
app.post('/semcourses', (req,res)=>{
	let body = JSON.parse(req.body.data);
	body.forEach((i,ind)=>{
				// update or insert
				console.log(i)
				course.findOne({code: i.course}).then(cdata=>{
					lecturer.findOne({lecturerID: i.lecturer}).then(ldata=>{
						semcourse.update({"year": i.year, "semester": i.semester, "programID": i.programID, "course": cdata._id},{$set: {
							credit: i.credit, lecturer: ldata._id
						}},{upsert: true}).then(console.log).catch(console.error);
					})
				})
				
				if(ind==body.length-1){
					res.send({done: true});
				}
	})
})

app.get('/fees', (req,res)=>{
	res.render("staff/fees")
})

app.get('/setfees', (req,res)=>{
	fee.find({continuous: true}).populate("program").then(cdata=>{
		fee.find({continuous: false}).populate("program").then(fdata=>{
			res.render("staff/setfees", {fdata, cdata})
		})
		
	})
	
})

app.post('/setfees/:opt',(req,res)=>{
	let continuous = true;
	if(req.params.opt=="fresh") continuous = false;
	let data = JSON.parse(req.body.data);
	console.log(data)
	data.forEach((i,e)=>{
		fee.update({"program": i.name, "continuous": continuous},
		{$set: {amount: i.value}},{upsert: true}).then(console.log).catch(console.error);
		if(e==data.length-1){
			res.send({done: true})
		}
	})
})

class tings {
	constructor(){
		this.arr = [];
		this.ids = [];
	}
	add(index,value){
		this.ids.push(index);
		this.arr.push({index,value});
	}
	getIndexes(){
		return this.ids;
	}
	getObject() {
		return this.arr;
	}
}

async function savor(found,amtarr){
				for(let i=0;i<found.length;i++){
					let npaid = new paidfee({
						studentID: found[i]._id,
						year: found[i].year,
						amount: amtarr[i].value,
						date: new Date()
					})
					await npaid.save();
				}
}

app.post('/xls', upload.single('xls'), (req,res)=>{
	// res.sendFile(req.file.path);
		// xlsParser.onFileSelection(req.file.path).then(data=>{
		// 	console.log(data)
		// }).catch(console.error)
		// let file = fs.readFileSync(req.file.path, 'utf8');
		// readExcelFile(file).then(console.log).catch(console.error)
		let obj = nodeXLS.parse(fs.readFileSync(req.file.path));
		let arr = new tings();
		obj.forEach(i=>{
			i.data.forEach(j=>{
				arr.add(...j);
			})
		})
		fee.validateIds(arr.getIndexes()).then(data=>{
			// console.log(data)
			let amtarr = arr.getObject();
			if(data.valid){
				savor(data.found, amtarr);
				res.render('staff/fees', {data: false, success: true})
			}else{
				res.render('staff/fees', {data})
			}
		})
		// console.log(resp)
		//console.log(obj[0].data)
})

app.post('/config', (req,res)=>{
	let {name, value} = req.body;
	config.updateOne({metaname: name}, {$set: {metaval: value}},{upsert: true}).then(d=>{
		res.json(d);
	})
})

app.get('/logout', (req,res)=>{
	delete req.session.staff;
	delete req.session.staffID;
	res.redirect('/login');
})

module.exports = app;