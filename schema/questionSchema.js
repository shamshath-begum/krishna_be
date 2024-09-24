const mongoose = require('mongoose');

// Update the schema to group questions under each chapter
const questionPaperSchema = new mongoose.Schema({
  medium: { type: String, required: true },
  subject: { type: String, required: true },
  chapter: { type: String, required: true },
  questions: [
    {
      questionPaper: { type: String, required: true },
      options: [{ type: String, required: true }],
      answer: { type: String, required: true },
      explanation: { type: String, required: true },
    }
  ]
});

const QuestionModel = mongoose.model('QuestionPaper', questionPaperSchema);
module.exports = QuestionModel;
