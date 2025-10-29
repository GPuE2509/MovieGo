// models/coupon.model.js
const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  coupon_name: { type: String, required: true, trim: true, maxlength: 100 },
  coupon_code: { type: String, required: true, unique: true, trim: true, maxlength: 100 },
  coupon_value: { type: Number, required: true, min: 0 },
  exchange_point: { type: Number, required: true, min: 0 },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });


module.exports = mongoose.model('Coupon', couponSchema);
