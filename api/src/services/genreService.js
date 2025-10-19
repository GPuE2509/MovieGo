const Genre = require('../models/genre');

class GenreService {
  async list({ search = '', page = 0, size = 10, sortField = 'genre_name', sortOrder = 'asc' }) {
    const filter = {};
    if (search) filter.genre_name = { $regex: search, $options: 'i' };

    const total = await Genre.countDocuments(filter);
    const data = await Genre.find(filter)
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
    const genre = await Genre.findById(id).lean();
    if (!genre) throw new Error('Genre not found');
    return genre;
  }

  async ensureNameUnique(name, excludeId = null) {
    const cond = { genre_name: { $regex: `^${name}$`, $options: 'i' } };
    if (excludeId) cond._id = { $ne: excludeId };
    const exists = await Genre.findOne(cond).lean();
    if (exists) {
      throw new Error('Genre name already exists');
    }
  }

  async create({ genre_name }) {
    await this.ensureNameUnique(genre_name);
    const doc = await Genre.create({ genre_name: genre_name.trim() });
    return doc.toObject();
  }

  async update(id, { genre_name }) {
    if (genre_name) {
      await this.ensureNameUnique(genre_name, id);
    }
    const updated = await Genre.findByIdAndUpdate(
      id,
      { ...(genre_name ? { genre_name: genre_name.trim() } : {}) },
      { new: true }
    ).lean();
    if (!updated) throw new Error('Genre not found');
    return updated;
  }

  async remove(id) {
    const res = await Genre.findByIdAndDelete(id).lean();
    if (!res) throw new Error('Genre not found');
    return true;
  }
}

module.exports = new GenreService();
