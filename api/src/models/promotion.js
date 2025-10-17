// models/promotion.model.js
const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  discount_percentage: { type: Number, min: 0, max: 100 },
  discount_amount: { type: Number, min: 0 },
  min_order_amount: { type: Number, min: 0 },
  max_discount_amount: { type: Number, min: 0 },
  start_date: { type: Date, required: true },
  end_date: { type: Date, required: true },
  is_active: { type: Boolean, default: true },
  image: { type: String },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('Promotion', promotionSchema);
