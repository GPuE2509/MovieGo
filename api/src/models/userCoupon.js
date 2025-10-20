const mongoose = require('mongoose');

const userCouponSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    coupon_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon', required: true, index: true },
    status: { type: String, enum: ['ACTIVE', 'USED', 'EXPIRED'], default: 'ACTIVE' },
    acquired_at: { type: Date, default: Date.now },
    used_at: { type: Date },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

userCouponSchema.index({ user_id: 1, coupon_id: 1 }, { unique: true });

module.exports = mongoose.model('UserCoupon', userCouponSchema);
