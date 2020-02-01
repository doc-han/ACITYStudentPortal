const express = require('express');
require('dotenv').config();
const app = express();
const mongoose =  require('mongoose');
const bodyParser = require('body-parser');

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static(__dirname+'/public'));
app.use(require('morgan')('dev'));
const dbURI = 'mongodb://127.0.0.1:2701'

mongoose.connect(dbURI,{
	useNewUrlParser: true
});
const db = mongoose.connection;
db.on('error',function(err){
	console.log(err);
})

//controllers over here
app.use('/auth', require("./controllers/auth"));
app.use('/student', require("./controllers/student"));
app.use('/staff', require("./controllers/staff"));
app.use('/', require("./controllers/main"));


app.listen(process.env.PORT, (err)=>{
  if(err) throw err;
  console.log(`server at port ${process.env.PORT}`);
})
