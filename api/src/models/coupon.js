// models/coupon.model.js
const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  coupon_code: { type: String, required: true, unique: true },
  discount_percentage: { type: Number, min: 0, max: 100 },
  discount_amount: { type: Number, min: 0 },
  min_order_amount: { type: Number, min: 0 },
  max_discount_amount: { type: Number, min: 0 },
  usage_limit: { type: Number, min: 0 },
  used_count: { type: Number, min: 0, default: 0 },
  start_date: { type: Date, required: true },
  end_date: { type: Date, required: true },
  is_active: { type: Boolean, default: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('Coupon', couponSchema);
