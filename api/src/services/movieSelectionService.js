const mongoose = require('mongoose');
const ShowTime = require('../models/showtime');
const Movie = require('../models/movie');
const homeService = require('./homeService');

class MovieSelectionService {
  // Movies that have active showtimes (now or upcoming)
  async getMoviesWithActiveShowtimes() {
    const now = new Date();
    // Find distinct movie ids that have active showtimes (active and not ended yet)
    const movieIds = await ShowTime.distinct('movie_id', {
      is_active: true,
      end_time: { $gte: now },
    });

    if (!movieIds || movieIds.length === 0) return [];

    const movies = await Movie.find({ _id: { $in: movieIds } })
      .populate('genres')
      .sort({ title: 1 })
      .lean();

    return movies.map((m) => homeService.convertToMovieResponse(m));
  }

  async getMovieDetail(id) {
    // Reuse homeservice mapping/detail to keep response consistent
    return homeService.getMovieDetail(id);
  }
}

module.exports = new MovieSelectionService();
