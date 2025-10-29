const UserCoupon = require('../models/userCoupon');
const Coupon = require('../models/coupon');
const User = require('../models/user');

class UserCouponService {
  async getUserCoupons(userId) {
    const userCoupons = await UserCoupon.find({ user_id: userId }).populate('coupon_id').lean();
    // Map to CouponResponse shape
    return userCoupons.map(uc => ({
      id: uc.coupon_id?._id,
      coupon_name: uc.coupon_id?.coupon_name,
      coupon_code: uc.coupon_id?.coupon_code,
      coupon_value: uc.coupon_id?.coupon_value,
      exchange_point: uc.coupon_id?.exchange_point,
      canExchange: false,
    }));
  }

  async getAvailableCoupons(userId) {
    const [owned, user] = await Promise.all([
      UserCoupon.find({ user_id: userId }).select('coupon_id').lean(),
      User.findById(userId).lean(),
    ]);
    const ownedIds = new Set(owned.map((o) => String(o.coupon_id)));
    const coupons = await Coupon.find({}).lean();
    const available = coupons
      .filter(c => !ownedIds.has(String(c._id)))
      .map(c => ({
        id: c._id,
        coupon_name: c.coupon_name,
        coupon_code: c.coupon_code,
        coupon_value: c.coupon_value,
        exchange_point: c.exchange_point,
        canExchange: (user?.point ?? 0) >= (c.exchange_point ?? 0),
      }))
      .filter(c => c.canExchange);
    return available;
  }

  async canExchange(userId, couponId) {
    const [coupon, user, owned] = await Promise.all([
      Coupon.findById(couponId).lean(),
      User.findById(userId).lean(),
      UserCoupon.findOne({ user_id: userId, coupon_id: couponId }).lean(),
    ]);
    if (!coupon) return { ok: false, reason: 'Coupon not found' };
    if (owned) return { ok: false, reason: 'Already owned' };
    const userPoint = user?.point ?? 0;
    if (userPoint < (coupon.exchange_point ?? 0)) return { ok: false, reason: 'Not enough points' };
    return { ok: true };
  }

  async exchange(userId, couponId) {
    const [coupon, user, owned] = await Promise.all([
      Coupon.findById(couponId).lean(),
      User.findById(userId), // need doc to update
      UserCoupon.findOne({ user_id: userId, coupon_id: couponId }).lean(),
    ]);
    if (!coupon) throw new Error('Cannot exchange: Coupon not found');
    if (owned) throw new Error('Cannot exchange: Already owned');
    if (!user) throw new Error('Cannot exchange: User not found');
    if ((user.point ?? 0) < (coupon.exchange_point ?? 0)) throw new Error('Cannot exchange: Not enough points');

    // Deduct points and assign coupon
    user.point = (user.point ?? 0) - (coupon.exchange_point ?? 0);
    await Promise.all([
      user.save(),
      UserCoupon.create({ user_id: userId, coupon_id: couponId }),
    ]);
    return true;
  }
}

module.exports = new UserCouponService();
