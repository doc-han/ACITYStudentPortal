const express = require('express');
const router = express.Router();
const {notLoggedIn} = require('../config/authorize');
const student = require('../models/studentModel');
const cloudinary = require('cloudinary').v2;

router.get('/', (req,res)=>{
    res.render('index');
})

router.get('/login', notLoggedIn, (req,res)=>{
    res.render("login");
})

router.post('/studentsearch', (req,res)=>{
    let {name} = req.body;
    student.find({$or: [{
        firstname: { $regex: new RegExp("^" + name.toLowerCase(), "i") }
    },{
        surname: { $regex: new RegExp("^" + name.toLowerCase(), "i") }
    }]},"studentID firstname surname").then(data=>{
        res.json(data);
    })
})

router.get('/studentviewer/:studentID', (req,res)=>{
    let {studentID} = req.params;
    student.findOne({studentID}).populate("program").then(data=>{
		let profilePic = cloudinary.url(data.profilePic);
		res.render('students/profile', {student: data,profilePic});
	})
})

module.exports = router;