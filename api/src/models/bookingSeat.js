// models/bookingSeat.model.js
const mongoose = require('mongoose');

const bookingSeatSchema = new mongoose.Schema({
  booking_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  seat_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Seat', required: true },
  quantity: { type: Number, min: 0, required: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('BookingSeat', bookingSeatSchema);
