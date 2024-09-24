// models/Student.js
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

const studentSchema = new mongoose.Schema({
  registerNumber: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  medium: { type: String, required: true },
  mainCourse: { type: String, required: true },
  subCourse: { type: String, required: true },
  instalmentDates: [{ type: Date }], // Array of instalment dates
  payments: [paymentSchema], // Array of payments
});

const Fees = mongoose.model('Fees', studentSchema);

module.exports = Fees;
