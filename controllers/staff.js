const express = require('express');
const app = express.Router();

app.get('/', (req,res)=>{
	res.render('staff/home');
})

app.get('/programs', (req,res)=>{
	res.render('staff/programs');
})

app.get('/courses', (req,res)=>{
	res.render('staff/courses');
})

module.exports = app;