const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    medium: { type: String, required: true },
    mainCourse: { type: String, required: true },
    subCourses: [{ type: String, required: true }]
});

 const mediumModel= mongoose.model('Course', courseSchema);
 module.exports={mediumModel}
