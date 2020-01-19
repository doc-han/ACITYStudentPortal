const express = require('express');
require('dotenv').config();
const app = express();

app.get('*', (req,res)=>{
  res.send('portal page');
})

app.listen(process.env.PORT, (err)=>{
  if(err) throw err;
  console.log(`server at port ${process.env.PORT}`);
})
