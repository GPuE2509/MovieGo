// models/theater.model.js
const mongoose = require('mongoose');

const theaterSchema = new mongoose.Schema({
  name: { type: String, required: true, maxlength: 100 },
  location: { type: String, required: true },
  latitude: { type: Number },
  longitude: { type: Number },
  state: { type: String },
  image: { type: String },
  phone: {
    type: String,
    required: true,
    match: [/^[0-9]{8,11}$/, 'Phone number must be from 8 to 11 digits'],
    maxlength: 11
  },
  is_deleted: { type: Boolean, default: false },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('Theater', theaterSchema);
