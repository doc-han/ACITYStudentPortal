const express = require('express');
const app = express.Router();
const cloudinary = require('cloudinary').v2;
const student = require('../models/studentModel');
const semcourse = require('../models/semCoursesModel');
const courseRegister = require('../models/courseRegisterModel');
const {registrationOpen} = require('../config/authorize');
const {paidfee} = require('../models/feeModel')

app.get('/', (req,res)=>{
	console.log(req.session.studentID)
	res.render('students/home');	
});

app.get('/profile',(req,res)=>{
	let {studentID} = req.session;
	student.findOne({studentID}).populate("program").then(data=>{
		let profilePic = cloudinary.url(data.profilePic);
		res.render('students/profile', {student: data,profilePic});
	})
	
})



app.get('/registration',registrationOpen, (req,res)=>{
	let {studentID} = req.session;
	student.findOne({studentID}).populate("program").then(sdata=>{
		semcourse.find({"programID": sdata.program, "year": sdata.year, "semester": 1}).populate([{path: "lecturer", select: "firstname surname"},{path: "course"}]).then(resp=>{
			courseRegister.findOne({"studentID": sdata._id, "year": sdata.year, "semester": 1}).populate("courses").then(cdata=>{
				let reg = [];
				if(cdata!=null){
					reg = resp.filter(i=>{
						let inn = false;
						cdata.courses.forEach(j=>{
							if((j._id.toString()).trim()==(i.course._id.toString()).trim()) inn = true;
						})
						return inn;
					})
					reg = reg.map(i=>{
						return {
							code: i.course.code,
							name: i.course.name,
							credit: i.credit,
							id: i.course._id
						}
					})
				}
				

				res.render('students/registration', {data: resp, sdata, reg});
			})
		})
	})
})
app.post('/registration', (req,res)=>{
	let {studentID} = req.session;
	let regcourses = JSON.parse(req.body.courses);
	regcourses = regcourses.map(i=>{
		return i.id;
	})
	student.findOne({studentID}).then(sdata=>{
		// semester has to be the current semester
		courseRegister.update({"studentID": sdata._id, "program": sdata.program, "year": sdata.year, "semester": 1},{
			courses: regcourses
		},{upsert: true}).then(data=>{
			 res.json({done: true})
		})
	})
})

app.get('/unavailable', (req,res)=>{
	res.send('This feature hasn\'t been enabled by the staff');
})

app.get('/fees',(req,res)=>{
	let {studentID} = req.session;
	student.findOne({studentID}).then(sdata=>{
		paidfee.find({studentID: sdata._id}).then(fdata=>{
			console.log(fdata);
			res.render("students/fees",{fdata})
		})
	})
})

app.get('/logout',(req,res)=>{
	delete req.session.student;
	delete req.session.studentID;
	res.redirect('/login');
})

module.exports = app;