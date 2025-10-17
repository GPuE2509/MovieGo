// models/seat.model.js
const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  screen_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Screen', required: true },
  seat_number: { type: String, required: true, maxlength: 50 },
  row: { type: String, required: true, maxlength: 10 },
  column: { type: Number, required: true, min: 1, default: 1 },
  is_variable: { type: Boolean, default: false },
  is_deleted: { type: Boolean, default: false },
  type: { type: String, enum: ['STANDARD', 'VIP', 'SWEETBOX'], required: true },
}, { 
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  // Ensure unique constraint for screen_id, row, and column combination
  unique: true
});

// Add compound index for unique constraint
seatSchema.index({ screen_id: 1, row: 1, column: 1 }, { unique: true });

module.exports = mongoose.model('Seat', seatSchema);
