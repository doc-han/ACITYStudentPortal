const express = require('express');
const router = express.Router();

router.post('/login', (req,res)=>{
    const { type, userID, userPass } = req.body;
    if(type==1){
        // do student login
				console.log("student")
				res.json({type: 1});
    }else if(type==2){
        // do lecturer
        console.log("lecturer")
    }else{
        // do staff 
				console.log("staff")
				res.json({type: 3})
    }
})

module.exports = router; 