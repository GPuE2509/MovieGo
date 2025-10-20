const UserCoupon = require('../models/userCoupon');
const Coupon = require('../models/coupon');

class UserCouponService {
  async getUserCoupons(userId) {
    return UserCoupon.find({ user_id: userId }).populate('coupon_id').lean();
  }

  async getAvailableCoupons(userId) {
    const now = new Date();
    // Coupons active and within date range, that user does NOT already own
    const owned = await UserCoupon.find({ user_id: userId }).select('coupon_id').lean();
    const ownedIds = owned.map((o) => o.coupon_id);
    return Coupon.find({
      _id: { $nin: ownedIds },
      is_active: true,
      start_date: { $lte: now },
      end_date: { $gte: now },
      $expr: { $or: [ { $lt: ['$used_count', '$usage_limit'] }, { $eq: ['$usage_limit', null] } ] }
    }).lean();
  }

  async canExchange(userId, couponId) {
    const now = new Date();
    const coupon = await Coupon.findById(couponId).lean();
    if (!coupon) return { ok: false, reason: 'Coupon not found' };
    if (!coupon.is_active) return { ok: false, reason: 'Coupon inactive' };
    if (coupon.start_date > now || coupon.end_date < now) return { ok: false, reason: 'Coupon not in valid date range' };
    if (coupon.usage_limit != null && coupon.used_count >= coupon.usage_limit) return { ok: false, reason: 'Coupon usage limit reached' };
    const owned = await UserCoupon.findOne({ user_id: userId, coupon_id: couponId }).lean();
    if (owned) return { ok: false, reason: 'Already owned' };
    return { ok: true };
  }

  async exchange(userId, couponId) {
    const check = await this.canExchange(userId, couponId);
    if (!check.ok) throw new Error(`Cannot exchange: ${check.reason}`);
    await UserCoupon.create({ user_id: userId, coupon_id: couponId });
    await Coupon.findByIdAndUpdate(couponId, { $inc: { used_count: 1 } });
    return true;
  }
}

module.exports = new UserCouponService();
