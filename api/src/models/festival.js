// models/festival.model.js
const mongoose = require('mongoose');

const festivalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  start_date: { type: Date, required: true },
  end_date: { type: Date, required: true },
  image: { type: String },
  is_active: { type: Boolean, default: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('Festival', festivalSchema);