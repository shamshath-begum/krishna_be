// models/ReceiptCounter.js

const mongoose = require('mongoose');

const receiptCounterSchema = new mongoose.Schema({
  year: { type: Number, required: true },
  count: { type: Number, required: true, default: 0 },
});

const ReceiptCounter = mongoose.model('ReceiptCounter', receiptCounterSchema);
module.exports = ReceiptCounter;
