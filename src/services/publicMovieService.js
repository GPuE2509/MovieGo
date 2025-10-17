import { Op } from 'sequelize';
import { Movie, Genre, MovieGenre, Showtime, Screen, Theater } from '../models/index.js';

class PublicMovieService {
  // Get movies with active showtimes
  async getMoviesWithActiveShowtimes(page = 0, pageSize = 10, date = null, theaterId = null) {
    const offset = page * pageSize;
    const limit = pageSize;
    
    // Use current date if no date provided
    const queryDate = date || new Date();
    
    // Build where clause for showtimes
    const showtimeWhere = {
      startTime: {
        [Op.gte]: queryDate
      },
      endTime: {
        [Op.gt]: new Date() // Current timestamp
      }
    };
    
    // Add theater filter if provided
    if (theaterId) {
      showtimeWhere['$Screen.theaterId$'] = theaterId;
    }
    
    // Get total count
    const total = await Movie.count({
      distinct: true,
      col: 'Movie.id',
      include: [{
        model: Showtime,
        as: 'showtimes',
        where: showtimeWhere,
        include: [{
          model: Screen,
          as: 'screen',
          attributes: []
        }],
        attributes: []
      }]
    });
    
    // Get paginated data
    const movies = await Movie.findAll({
      include: [
        {
          model: Genre,
          as: 'genres',
          through: {
            attributes: []
          },
          attributes: ['name']
        },
        {
          model: Showtime,
          as: 'showtimes',
          where: showtimeWhere,
          include: [{
            model: Screen,
            as: 'screen',
            attributes: []
          }],
          attributes: [],
          required: true
        }
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });
    
    // Calculate pagination info
    const totalPages = Math.ceil(total / pageSize);
    const hasNext = page < totalPages - 1;
    const hasPrevious = page > 0;
    
    return {
      total,
      page,
      size: pageSize,
      totalPages,
      hasNext,
      hasPrevious,
      data: movies.map(movie => ({
        id: movie.id,
        title: movie.title,
        description: movie.description,
        author: movie.author,
        actors: movie.actors,
        image: movie.image,
        trailer: movie.trailer,
        type: movie.type,
        duration: movie.duration,
        nations: movie.nation,
        releaseDate: movie.releaseDate,
        createdAt: movie.createdAt,
        updatedAt: movie.updatedAt,
        genreNames: movie.genres ? movie.genres.map(genre => genre.name) : []
      }))
    };
  }

  // Get movie details by ID
  async getMovieDetails(id) {
    const movie = await Movie.findByPk(id, {
      include: [
        {
          model: Genre,
          as: 'genres',
          through: {
            attributes: []
          },
          attributes: ['name']
        }
      ]
    });
    
    if (!movie) {
      throw new Error('Movie not found');
    }
    
    return {
      id: movie.id,
      title: movie.title,
      description: movie.description,
      author: movie.author,
      actors: movie.actors,
      image: movie.image,
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

  // Get movies showing (for home page)
  async getMoviesShowing(now = new Date()) {
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + (7 - today.getDay())); // Next Sunday
    endOfWeek.setHours(23, 59, 59, 999);
    
    const movies = await Movie.findAll({
      include: [
        {
          model: Genre,
          as: 'genres',
          through: {
            attributes: []
          },
          attributes: ['name']
        },
        {
          model: Showtime,
          as: 'showtimes',
          where: {
            startTime: {
              [Op.between]: [today, endOfWeek]
            }
          },
          attributes: [],
          required: true
        }
      ],
      where: {
        releaseDate: {
          [Op.lte]: now
        }
      },
      order: [['createdAt', 'DESC']]
    });
    
    return movies.map(movie => ({
      id: movie.id,
      title: movie.title,
      description: movie.description,
      author: movie.author,
      actors: movie.actors,
      image: movie.image,
      trailer: movie.trailer,
      type: movie.type,
      duration: movie.duration,
      nations: movie.nation,
      releaseDate: movie.releaseDate,
      createdAt: movie.createdAt,
      updatedAt: movie.updatedAt,
      genreNames: movie.genres ? movie.genres.map(genre => genre.name) : []
    }));
  }

  // Get movies coming soon
  async getMoviesComing(now = new Date()) {
    const movies = await Movie.findAll({
      include: [
        {
          model: Genre,
          as: 'genres',
          through: {
            attributes: []
          },
          attributes: ['name']
        }
      ],
      where: {
        releaseDate: {
          [Op.gt]: now
        }
      },
      order: [['releaseDate', 'ASC']]
    });
    
    return movies.map(movie => ({
      id: movie.id,
      title: movie.title,
      description: movie.description,
      author: movie.author,
      actors: movie.actors,
      image: movie.image,
      trailer: movie.trailer,
      type: movie.type,
      duration: movie.duration,
      nations: movie.nation,
      releaseDate: movie.releaseDate,
      createdAt: movie.createdAt,
      updatedAt: movie.updatedAt,
      genreNames: movie.genres ? movie.genres.map(genre => genre.name) : []
    }));
  }

  // Get movie trailer
  async getMovieTrailer(id) {
    const movie = await Movie.findByPk(id, {
      attributes: ['trailer']
    });
    
    if (!movie) {
      throw new Error('Movie not found');
    }
    
    return movie.trailer;
  }
}

export default new PublicMovieService();
