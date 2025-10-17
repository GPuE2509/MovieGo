import { Op } from 'sequelize';
import { Movie, Genre, News, Festival, Promotion, TicketPrice, Banner } from '../models/index.js';

class HomeService {
  // Get all genres
  async getAllGenres() {
    return await Genre.findAll({
      order: [['name', 'ASC']]
    });
  }

  // Get theaters near location (simplified version)
  async getTheatersNear(lat, lon, radius, date, limit) {
    // This would need Theater and Showtime models
    // For now, return empty array
    return [];
  }

  // Get all movies showing
  async getAllMoviesShowing() {
    const now = new Date();
    
    // Get movies with showtimes between today and end of week
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + 7);
    
    const movies = await Movie.findAll({
      where: {
        releaseDate: {
          [Op.lte]: now
        }
      },
      include: [{
        model: Genre,
        as: 'genres',
        through: { attributes: [] }
      }],
      order: [['createdAt', 'DESC']]
    });

    return movies.map(movie => this.convertToMovieResponse(movie));
  }

  // Get all movies coming
  async getAllMoviesComing(page = 0, pageSize = 10) {
    const now = new Date();
    const offset = page * pageSize;
    
    const { count, rows } = await Movie.findAndCountAll({
      where: {
        releaseDate: {
          [Op.gt]: now
        }
      },
      include: [{
        model: Genre,
        as: 'genres',
        through: { attributes: [] }
      }],
      order: [['releaseDate', 'ASC']],
      limit: pageSize,
      offset: offset
    });

    const movieResponses = rows.map(movie => this.convertToMovieResponse(movie));

    return {
      total: count,
      page: page,
      size: pageSize,
      data: movieResponses,
      totalPages: Math.ceil(count / pageSize),
      hasNext: page < Math.ceil(count / pageSize) - 1,
      hasPrevious: page > 0
    };
  }

  // Get movie detail
  async getMovieDetail(id) {
    const movie = await Movie.findByPk(id, {
      include: [{
        model: Genre,
        as: 'genres',
        through: { attributes: [] }
      }]
    });

    if (!movie) {
      throw new Error('Movie not found');
    }

    return this.convertToMovieResponse(movie);
  }

  // Get movie trailer
  async getMovieTrailer(id) {
    const movie = await Movie.findByPk(id);
    
    if (!movie) {
      throw new Error('Movie not found');
    }

    return movie.trailer;
  }

  // Get all news
  async getAllNews(page = 0, pageSize = 10, sortField = 'title', sortOrder = 'asc', search = '') {
    const offset = page * pageSize;
    const order = [[sortField, sortOrder.toUpperCase()]];
    
    const whereClause = {};
    if (search) {
      whereClause.title = {
        [Op.like]: `%${search}%`
      };
    }

    const { count, rows } = await News.findAndCountAll({
      where: whereClause,
      order: order,
      limit: pageSize,
      offset: offset
    });

    return {
      total: count,
      page: page,
      size: pageSize,
      data: rows,
      totalPages: Math.ceil(count / pageSize),
      hasNext: page < Math.ceil(count / pageSize) - 1,
      hasPrevious: page > 0
    };
  }

  // Get news by ID
  async getNewsById(id) {
    const news = await News.findByPk(id);
    
    if (!news) {
      throw new Error('News not found');
    }

    return news;
  }

  // Get all festivals
  async getAllFestivals(page = 0, pageSize = 10, sortField = 'title', sortOrder = 'asc', search = '') {
    const offset = page * pageSize;
    const order = [[sortField, sortOrder.toUpperCase()]];
    
    const whereClause = {};
    if (search) {
      whereClause.title = {
        [Op.like]: `%${search}%`
      };
    }

    const { count, rows } = await Festival.findAndCountAll({
      where: whereClause,
      order: order,
      limit: pageSize,
      offset: offset
    });

    return {
      total: count,
      page: page,
      size: pageSize,
      data: rows,
      totalPages: Math.ceil(count / pageSize),
      hasNext: page < Math.ceil(count / pageSize) - 1,
      hasPrevious: page > 0
    };
  }

  // Get festival detail
  async getFestivalDetail(id) {
    const festival = await Festival.findByPk(id);
    
    if (!festival) {
      throw new Error('Festival not found');
    }

    return festival;
  }

  // Get all promotions
  async getAllPromotions(page = 0, pageSize = 10, sortField = 'title', sortOrder = 'asc', search = '') {
    const offset = page * pageSize;
    const order = [[sortField, sortOrder.toUpperCase()]];
    
    const whereClause = {};
    if (search) {
      whereClause.title = {
        [Op.like]: `%${search}%`
      };
    }

    const { count, rows } = await Promotion.findAndCountAll({
      where: whereClause,
      order: order,
      limit: pageSize,
      offset: offset
    });

    return {
      total: count,
      page: page,
      size: pageSize,
      data: rows,
      totalPages: Math.ceil(count / pageSize),
      hasNext: page < Math.ceil(count / pageSize) - 1,
      hasPrevious: page > 0
    };
  }

  // Get promotion detail
  async getPromotionDetail(id) {
    const promotion = await Promotion.findByPk(id);
    
    if (!promotion) {
      throw new Error('Promotion not found');
    }

    return promotion;
  }

  // Get all ticket prices
  async getAllTicketPrices() {
    return await TicketPrice.findAll({
      order: [['typeMovie', 'ASC'], ['typeSeat', 'ASC']]
    });
  }

  // Helper method to convert Movie to MovieResponse format
  convertToMovieResponse(movie) {
    return {
      id: movie.id,
      title: movie.title,
      description: movie.description,
      author: movie.author,
      image: movie.image,
      actors: movie.actors,
      trailer: movie.trailer,
      type: movie.type,
      duration: movie.duration,
      nations: movie.nation,
      releaseDate: movie.releaseDate,
      createdAt: movie.createdAt,
      updatedAt: movie.updatedAt,
      genreNames: movie.genres ? movie.genres.map(genre => genre.name) : []
    };
  }
}

export default new HomeService();
