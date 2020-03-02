const express = require('express');
const router = express.Router();
const student = require('../models/studentModel');

router.post('/login', (req,res)=>{
    const { type, userID, userPass } = req.body;
    if(type==1){
        // do student login
        student.findOne({studentID: userID, password: userPass}).then(data=>{
            if(data){
                req.session.student = true;
                req.session.studentID = userID;
                res.json({done: true, msg: `Welcome ${data.firstname}`});
            }else{
                res.json({done: false, msg: `Invalid student details`});
            }
        })
    }else if(type==2){
        // do lecturer
        console.log("lecturer")
    }else{
        // do staff 
        console.log("staff")
        req.session.staff = true;
        req.session.staffID = userID;
		res.json({done: true, msg: `Welcome Staff memeber`});
    }
})

module.exports = router; 