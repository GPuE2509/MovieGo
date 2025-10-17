// models/screen.model.js
const mongoose = require('mongoose');

const screenSchema = new mongoose.Schema({
  name: { type: String, maxlength: 100 },
  seat_capacity: { type: Number, min: 0 },
  max_rows: { type: Number, min: 0, required: true, default: 0 },
  max_columns: { type: Number, min: 0, required: true, default: 0 },
  theater_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Theater', required: true },
  is_deleted: { type: Boolean, default: false },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('Screen', screenSchema);
