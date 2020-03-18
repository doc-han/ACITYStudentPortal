const mongoose = require('mongoose');

const Schema = mongoose.Schema;

let lecturerSchema = new Schema({
		firstname: {
			type: String,
			required: true
		},
		surname: {
			type: String, 
			required: true
		},
		lecturerID: {
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
		password: {
			type: String,
			required: true
		},
		profilePic: {
			type: String,
			required: true
		}
});

const lecturer = mongoose.model('lecturer', lecturerSchema);

module.exports = lecturer;