const mongoose = require('mongoose');

const Schema = mongoose.Schema;

let courseRegisterSchema = new Schema({
    studentID: {
        type: Schema.Types.ObjectId,
        ref: 'student',
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    semester: {
        type: Number,
        required: true
    },
    courses: [{
        type: Schema.Types.ObjectId,
        ref: 'course',
        required: true
    }]
});

module.exports = mongoose.model('courseRegister', courseRegisterSchema);