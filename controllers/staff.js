const express = require('express');
const app = express.Router();
const rs = require('randomstring');
const program = require('../models/programModel');
const course = require('../models/courseModel');
const student = require('../models/studentModel');
const lecturer = require('../models/lecturerModel');
const semcourse = require('../models/semCoursesModel');

app.get('/', (req,res)=>{
	res.render('staff/home');
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
	nProgram.save();
	res.redirect('/staff/programs');
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
			console.log(data)
			let id = Math.floor(Math.random()*10000000);
			let pass = (rs.generate(7)).toLowerCase();
			
			res.render('staff/students', {data, pdata, pd: {id, pass}});
		})
	})
	
})
app.post('/students', (req,res)=>{
	// add new student
	let nStudent = new student(req.body);
	nStudent.save();
	res.redirect('/staff/students');
})

app.get('/lecturers', (req,res)=>{
		lecturer.find({}).then(data=>{
			let id = Math.floor(Math.random()*10000000);
			let pass = (rs.generate(7)).toLowerCase();
			res.render('staff/lecturers', {data, pd: {id, pass}});
		})
	
})
app.post('/lecturers', (req,res)=>{
	// add new student
	// res.send(req.body);
	console.log(req.body)
	let nLecturer = new lecturer(req.body);
	nLecturer.save();
	res.redirect('/staff/lecturers');
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
	// program.findOne({code: body.code}).then(pres=>{
	// 	let sem1 = new semcourse({
	// 		programID: pres._id,
	// 		year: body.year,
	// 		semester: 1,
	// 		courses: body["courses1[]"],
	// 		lecturers: body["lecturers1[]"],
	// 		credits: body["credits1[]"],
	// 	})
	// 	let sem2 = new semcourse({
	// 		programID: pres._id,
	// 		year: body.year,
	// 		semester: 2,
	// 		courses: body["courses2[]"],
	// 		lecturers: body["lecturers2[]"],
	// 		credits: body["credits2[]"],
	// 	})
	// 	sem1.save().then(r=>{
	// 		sem2.save().then(rr=>{
	// 			res.json({done: true})
	// 		})
	// 	})
	// })
	//res.json(req.body)
})

app.get('/logout', (req,res)=>{
	delete req.session.staff;
	delete req.session.staffID;
	res.redirect('/login');
})

module.exports = app;