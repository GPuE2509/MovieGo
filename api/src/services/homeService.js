const { Types } = require('mongoose');
const Movie = require('../models/movie');
const Genre = require('../models/genre');
const News = require('../models/news');
const Festival = require('../models/festival');
const Promotion = require('../models/promotion');
const TicketPrice = require('../models/ticketPrice');

class HomeService {
  // Genres
  async getAllGenres() {
    return Genre.find({}).sort({ genre_name: 1 }).lean();
  }

  // Theaters near (placeholder)
  async getTheatersNear(lat, lon, radius = 5, date, limit = 10) {
    return [];
  }

  // Movies showing (release_date <= now)
  async getAllMoviesShowing() {
    const now = new Date();
    const movies = await Movie.find({
      $or: [
        { release_date: { $lte: now } },
        { release_date: { $exists: false } }
      ]
    })
      .populate('genres')
      .sort({ created_at: -1 })
      .lean();

    return movies.map((m) => this.convertToMovieResponse(m));
  }

  // Movies coming (release_date > now) with pagination
  async getAllMoviesComing(page = 0, pageSize = 10) {
    const now = new Date();
    const filter = { release_date: { $gt: now } };
    const total = await Movie.countDocuments(filter);
    const rows = await Movie.find(filter)
      .populate('genres')
      .sort({ release_date: 1 })
      .skip(page * pageSize)
      .limit(pageSize)
      .lean();

    const data = rows.map((m) => this.convertToMovieResponse(m));
    return {
      total,
      page,
      size: pageSize,
      data,
      totalPages: Math.ceil(total / pageSize) || 0,
      hasNext: page < Math.ceil(total / pageSize) - 1,
      hasPrevious: page > 0
    };
  }

  // Movie detail
  async getMovieDetail(id) {
    const movie = await Movie.findById(id).populate('genres').lean();
    if (!movie) throw new Error('Movie not found');
    return this.convertToMovieResponse(movie);
  }

  // Movie trailer only
  async getMovieTrailer(id) {
    const movie = await Movie.findById(id).lean();
    if (!movie) throw new Error('Movie not found');
    return movie.trailer || null;
  }

  // News list
  async getAllNews(page = 0, pageSize = 10, sortField = 'title', sortOrder = 'asc', search = '') {
    const filter = {};
    if (search) filter.title = { $regex: search, $options: 'i' };
    const total = await News.countDocuments(filter);
    const data = await News.find(filter)
      .sort({ [sortField]: sortOrder.toLowerCase() === 'desc' ? -1 : 1 })
      .skip(page * pageSize)
      .limit(pageSize)
      .lean();
    return {
      total,
      page,
      size: pageSize,
      data,
      totalPages: Math.ceil(total / pageSize) || 0,
      hasNext: page < Math.ceil(total / pageSize) - 1,
      hasPrevious: page > 0
    };
  }

  // News detail
  async getNewsById(id) {
    const news = await News.findById(id).lean();
    if (!news) throw new Error('News not found');
    return news;
  }

  // Festivals list
  async getAllFestivals(page = 0, pageSize = 10, sortField = 'name', sortOrder = 'asc', search = '') {
    const filter = {};
    if (search) filter.name = { $regex: search, $options: 'i' };
    const total = await Festival.countDocuments(filter);
    const data = await Festival.find(filter)
      .sort({ [sortField]: sortOrder.toLowerCase() === 'desc' ? -1 : 1 })
      .skip(page * pageSize)
      .limit(pageSize)
      .lean();
    return {
      total,
      page,
      size: pageSize,
      data,
      totalPages: Math.ceil(total / pageSize) || 0,
      hasNext: page < Math.ceil(total / pageSize) - 1,
      hasPrevious: page > 0
    };
  }

  // Festival detail
  async getFestivalDetail(id) {
    const festival = await Festival.findById(id).lean();
    if (!festival) throw new Error('Festival not found');
    return festival;
  }

  // Promotions list
  async getAllPromotions(page = 0, pageSize = 10, sortField = 'title', sortOrder = 'asc', search = '') {
    const filter = {};
    if (search) filter.title = { $regex: search, $options: 'i' };
    const total = await Promotion.countDocuments(filter);
    const data = await Promotion.find(filter)
      .sort({ [sortField]: sortOrder.toLowerCase() === 'desc' ? -1 : 1 })
      .skip(page * pageSize)
      .limit(pageSize)
      .lean();
    return {
      total,
      page,
      size: pageSize,
      data,
      totalPages: Math.ceil(total / pageSize) || 0,
      hasNext: page < Math.ceil(total / pageSize) - 1,
      hasPrevious: page > 0
    };
  }

  // Promotion detail
  async getPromotionDetail(id) {
    const promotion = await Promotion.findById(id).lean();
    if (!promotion) throw new Error('Promotion not found');
    return promotion;
  }

  // Ticket prices
  async getAllTicketPrices() {
    return TicketPrice.find({}).sort({ seat_type: 1, price: 1 }).lean();
  }

  // Mapper similar to BE response
  convertToMovieResponse(movie) {
    return {
      id: movie._id,
      title: movie.title,
      description: movie.description,
      author: movie.author,
      image: movie.image,
      actors: movie.actors,
      trailer: movie.trailer,
      type: movie.type,
      duration: movie.duration,
      nations: movie.nation,
      releaseDate: movie.release_date,
      createdAt: movie.created_at,
      updatedAt: movie.updated_at,
      genreNames: Array.isArray(movie.genres) ? movie.genres.map(g => g.genre_name) : []
    };
  }
}

module.exports = new HomeService();
