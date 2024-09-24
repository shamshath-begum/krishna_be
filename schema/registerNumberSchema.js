const mongoose=require("mongoose")

const RegisterNumberSchema = new mongoose.Schema({
    lastNumber: {
      type: Number,
      required: true,
      default: 1000
    }
  });
  
  const RegisterNumberModel = mongoose.model('registerNumber', RegisterNumberSchema);
  module.exports = {RegisterNumberModel};