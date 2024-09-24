const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  registerNumber:{type:String,required:true},
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  gender: { type: String, required: true },
  fatherName: { type: String, required: true },
  occupation: { type: String },
  dob: { type: Date, required: true },
  image: { type: String },  // Store image as a path or base64 encoded string
  city: { type: String, required: true },
  aadharNumber: { type: String, required: true, unique: true },
  school: { type: String },
  pincode: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobileNumber: { type: String, required: true, unique: true },
  address: { type: String, required: true },
  medium: { type: String, required: true },
  mainCourse: { type: String, required: true },
  subCourse: { type: String, required: true },
  totalAmount: { type: Number, required: true },  // Total amount to be paid
  remainingAmount: { type: Number, required: true },
  paidAmounts: [{ type: Number }],  
  instalmentDates: [{ type: Date }],
  
  status: { type: String, default: "active"},
  createdAt: { type: Date, default: Date.now }
});

const Student = mongoose.model('Student', studentSchema);

module.exports = {Student};
