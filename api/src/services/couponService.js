const Coupon = require('../models/coupon');

class CouponService {
  async list() {
    return Coupon.find({}).sort({ created_at: -1 }).lean();
  }

  async getById(id) {
    const c = await Coupon.findById(id).lean();
    if (!c) throw new Error('Coupon not found');
    return c;
  }

  async create(payload) {
    const exists = await Coupon.findOne({ coupon_code: payload.coupon_code }).lean();
    if (exists) throw new Error('Coupon code already exists');
    const doc = await Coupon.create(payload);
    return doc.toObject();
  }

  async update(id, payload) {
    if (payload.coupon_code) {
      const dup = await Coupon.findOne({ coupon_code: payload.coupon_code, _id: { $ne: id } }).lean();
      if (dup) throw new Error('Coupon code already exists');
    }
    const updated = await Coupon.findByIdAndUpdate(id, payload, { new: true }).lean();
    if (!updated) throw new Error('Coupon not found');
    return updated;
  }

  async remove(id) {
    const res = await Coupon.findByIdAndDelete(id).lean();
    if (!res) throw new Error('Coupon not found');
    return true;
  }
}

module.exports = new CouponService();
