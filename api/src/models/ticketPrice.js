// models/ticketPrice.model.js
const mongoose = require('mongoose');

const ticketPriceSchema = new mongoose.Schema({
  seat_type: { 
    type: String, 
    enum: ['STANDARD', 'VIP', 'SWEETBOX'], 
    required: true 
  },
  movie_type: {
    type: String,
    enum: ['2D', '3D', '4DX', 'IMAX'],
    required: true,
  },
  day_type: { type: Boolean, required: true },
  start_time: { type: String, required: true },
  end_time: { type: String, required: true },
  price: { type: Number, min: 0, required: true },
  is_active: { type: Boolean, default: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('TicketPrice', ticketPriceSchema);