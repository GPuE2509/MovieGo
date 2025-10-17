// models/payment.model.js
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  booking_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  payment_method_id: { type: mongoose.Schema.Types.ObjectId, ref: 'PaymentMethod', required: true },
  payment_status: { 
    type: String, 
    enum: ['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'], 
    required: true 
  },
  payment_time: { type: Date, required: true },
  amount: { type: Number, min: 0, required: true },
  transaction_id: { type: String, required: true, maxlength: 255 },
});

module.exports = mongoose.model('Payment', paymentSchema);
