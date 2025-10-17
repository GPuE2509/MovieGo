// models/paymentMethod.model.js
const mongoose = require('mongoose');

const paymentMethodSchema = new mongoose.Schema({
  method_name: { type: String, required: true, unique: true },
  is_active: { type: Boolean, default: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('PaymentMethod', paymentMethodSchema);
