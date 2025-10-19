const News = require('../models/news');

class NewsService {
  async list({ search = '', page = 0, size = 10, sortField = 'created_at', sortOrder = 'desc' }) {
    const filter = {};
    if (search) filter.title = { $regex: search, $options: 'i' };

    const total = await News.countDocuments(filter);
    const data = await News.find(filter)
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

  async create(payload) {
    const doc = await News.create(payload);
    return doc.toObject();
  }

  async update(id, payload) {
    const updated = await News.findByIdAndUpdate(id, payload, { new: true }).lean();
    if (!updated) throw new Error('News not found');
    return updated;
  }

  async remove(id) {
    const res = await News.findByIdAndDelete(id).lean();
    if (!res) throw new Error('News not found');
    return true;
  }
}

module.exports = new NewsService();
