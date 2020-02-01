const express = require('express');
const app = express.Router();

app.get('/', (req,res)=>{
	res.render('students/home');	
});

app.get('/profile',(req,res)=>{
	res.render('students/profile');
})

app.get('/registration',(req,res)=>{
	res.render('students/registration');
})

module.exports = app;