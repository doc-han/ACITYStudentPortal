const mongoose = require('mongoose');

const Schema = mongoose.Schema;

let studentSchema = new Schema({
		firstname: {
			type: String,
			required: true
		},
		surname: {
			type: String, 
			required: true
		},
		studentID: {
			type: String,
			required: true
		},
		email: {
			type: String,
			required: true
		},
		mobile: {
			type: String,
			required: true
		},
		program: {
			type: Schema.Types.ObjectId,
			ref: 'Program'
		},
		password: {
			type: String,
			required: true
		}
});

const student = mongoose.model('students', studentSchema);

module.exports = student;