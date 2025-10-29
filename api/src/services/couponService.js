const Coupon = require('../models/coupon');

class CouponService {
  async list({ page = 0, pageSize = 10, sortField = 'coupon_name', sortOrder = 'asc', search = '' } = {}) {
    const filter = search
      ? { $or: [
          { coupon_name: { $regex: search, $options: 'i' } },
          { coupon_code: { $regex: search, $options: 'i' } },
        ] }
      : {};
    const sort = { [sortField]: sortOrder === 'desc' ? -1 : 1 };
    const skip = Number(page) * Number(pageSize);
    const limit = Number(pageSize);

    const [items, total] = await Promise.all([
      Coupon.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      Coupon.countDocuments(filter),
    ]);

    return {
      content: items,
      totalElements: total,
      totalPages: Math.ceil(total / (limit || 1)),
      page: Number(page),
      pageSize: Number(pageSize),
    };
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
