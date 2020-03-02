const express = require('express');
const router = express.Router();
const {notLoggedIn} = require('../config/authorize');

router.get('/', (req,res)=>{
    res.render('index');
})

router.get('/login', notLoggedIn, (req,res)=>{
    res.render("login");
})


module.exports = router;