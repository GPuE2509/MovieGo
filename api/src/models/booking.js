// models/booking.model.js
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  showtime_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ShowTime', required: true },
  total_seat: { type: Number, min: 0 },
  status: { 
    type: String, 
    enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'], 
    default: 'PENDING',
    required: true 
  },
  total_price_movie: { type: Number, min: 0 },
  booking_seats: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'BookingSeat' 
  }],
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('Booking', bookingSchema);
