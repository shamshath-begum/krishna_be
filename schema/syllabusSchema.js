const mongoose = require('mongoose');

// Define Chapter Schema
const chapterSchema = new mongoose.Schema({
  name: String
});

// Define Subject Schema with Chapters as an Array of Chapter Schema
const subjectSchema = new mongoose.Schema({
  name: String,
  chapters: [chapterSchema]
});

// Define Medium Schema with Subjects as an Array of Subject Schema
const mediumSchema = new mongoose.Schema({
  name: String,
  subjects: [subjectSchema]
});

// Define the Syllabus Model
const Syllabus = mongoose.model('Syllabus', mediumSchema);
module.exports = Syllabus;