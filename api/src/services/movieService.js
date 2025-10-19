const mongoose = require('mongoose');
const Movie = require('../models/movie');
const Genre = require('../models/genre');

class MovieService {
  async getAllMovies(title, author, sortBy = 'created_at', page = 0, size = 10) {
    const filter = {};
    if (title) filter.title = { $regex: title, $options: 'i' };
    if (author) filter.author = { $regex: author, $options: 'i' };

    const sort = {};
    // Map BE field names to NEW schema fields if necessary
    const sortField = sortBy === 'createdAt' ? 'created_at' : sortBy === 'updatedAt' ? 'updated_at' : sortBy;
    sort[sortField] = -1;

    const totalElements = await Movie.countDocuments(filter);
    const content = await Movie.find(filter)
      .populate('genres')
      .sort(sort)
      .skip(page * size)
      .limit(size)
      .lean();

    return {
      content,
      totalElements,
      totalPages: Math.ceil(totalElements / size) || 0,
      size,
      number: page,
      first: page === 0,
      last: page >= (Math.ceil(totalElements / size) - 1),
      numberOfElements: content.length
    };
  }

  async getMovieById(id) {
    const movie = await Movie.findById(id).populate('genres').lean();
    if (!movie) throw new Error('Movie not found');
    return movie;
    }

  async validateGenresExist(genreIds) {
    if (!Array.isArray(genreIds) || genreIds.length === 0) return [];
    const ids = genreIds.map((g) => new mongoose.Types.ObjectId(g));
    const existing = await Genre.find({ _id: { $in: ids } }).select('_id').lean();
    const existingSet = new Set(existing.map((g) => String(g._id)));
    const missing = ids.map(String).filter((id) => !existingSet.has(id));
    if (missing.length > 0) {
      throw new Error(`Invalid genres: not found -> ${missing.join(',')}`);
    }
    return ids;
  }

  async createMovie(movieData, genreIds = []) {
    const validGenreObjectIds = await this.validateGenresExist(genreIds);
    const doc = new Movie({
      ...movieData,
      genres: validGenreObjectIds
    });
    await doc.save();
    return this.getMovieById(doc._id);
  }

  async updateMovie(id, movieData, genreIds = null) {
    const update = { ...movieData };
    if (genreIds !== null) {
      const validGenreObjectIds = await this.validateGenresExist(genreIds);
      update.genres = validGenreObjectIds;
    }
    const updated = await Movie.findByIdAndUpdate(id, update, { new: true });
    if (!updated) throw new Error('Movie not found');
    return this.getMovieById(id);
  }

  async deleteMovie(id) {
    const res = await Movie.findByIdAndDelete(id);
    if (!res) throw new Error('Movie not found');
    return true;
  }

  async getAllGenres() {
    return Genre.find({}).sort({ genre_name: 1 }).lean();
  }
}

module.exports = new MovieService();
