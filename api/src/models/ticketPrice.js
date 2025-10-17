// models/ticketPrice.model.js
const mongoose = require('mongoose');

const ticketPriceSchema = new mongoose.Schema({
  seat_type: { 
    type: String, 
    enum: ['STANDARD', 'VIP', 'SWEETBOX'], 
    required: true 
  },
  price: { type: Number, min: 0, required: true },
  is_active: { type: Boolean, default: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('TicketPrice', ticketPriceSchema);