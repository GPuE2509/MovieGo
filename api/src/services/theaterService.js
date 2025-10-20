const Theater = require('../models/theater');

class TheaterService {
  async list({ search = '', city = '', page = 0, size = 10, sortField = 'created_at', sortOrder = 'desc', is_active }) {
    const filter = {};
    if (search) filter.name = { $regex: search, $options: 'i' };
    if (city) filter.city = { $regex: city, $options: 'i' };
    if (typeof is_active === 'boolean') filter.is_active = is_active;

    const total = await Theater.countDocuments(filter);
    const data = await Theater.find(filter)
      .sort({ [sortField]: sortOrder.toLowerCase() === 'desc' ? -1 : 1 })
      .skip(page * size)
      .limit(size)
      .lean();

    return {
      total,
      page,
      size,
      data,
      totalPages: Math.ceil(total / size) || 0,
      hasNext: page < Math.ceil(total / size) - 1,
      hasPrevious: page > 0,
    };
  }

  async getById(id) {
    const doc = await Theater.findById(id).lean();
    if (!doc) throw new Error('Theater not found');
    return doc;
  }

  async create(payload) {
    const doc = await Theater.create({
      name: payload.name.trim(),
      address: payload.address,
      city: payload.city,
      phone: payload.phone,
      email: payload.email,
      is_active: payload.is_active !== undefined ? payload.is_active : true,
    });
    return doc.toObject();
  }

  async update(id, payload) {
    const updated = await Theater.findByIdAndUpdate(
      id,
      {
        ...(payload.name !== undefined ? { name: payload.name.trim() } : {}),
        ...(payload.address !== undefined ? { address: payload.address } : {}),
        ...(payload.city !== undefined ? { city: payload.city } : {}),
        ...(payload.phone !== undefined ? { phone: payload.phone } : {}),
        ...(payload.email !== undefined ? { email: payload.email } : {}),
        ...(payload.is_active !== undefined ? { is_active: payload.is_active } : {}),
      },
      { new: true }
    ).lean();
    if (!updated) throw new Error('Theater not found');
    return updated;
  }

  async remove(id) {
    const res = await Theater.findByIdAndDelete(id).lean();
    if (!res) throw new Error('Theater not found');
    return true;
  }
}

module.exports = new TheaterService();
