import { Op } from 'sequelize';
import { Movie, Genre, MovieGenre } from '../models/index.js';

class MovieService {
  // Get all movies with pagination and filters
  async getAllMovies(title, author, sortBy, page, size) {
    const offset = page * size;
    const limit = size;
    
    const whereClause = {};
    
    if (title) {
      whereClause.title = {
        [Op.like]: `%${title}%`
      };
    }
    
    if (author) {
      whereClause.author = {
        [Op.like]: `%${author}%`
      };
    }
    
    const { count, rows } = await Movie.findAndCountAll({
      where: whereClause,
      include: [{
        model: Genre,
        as: 'genres',
        through: { attributes: [] }
      }],
      order: [[sortBy, 'DESC']],
      limit,
      offset,
      distinct: true
    });
    
    return {
      content: rows,
      totalElements: count,
      totalPages: Math.ceil(count / size),
      size,
      number: page,
      first: page === 0,
      last: page >= Math.ceil(count / size) - 1,
      numberOfElements: rows.length
    };
  }
  
  // Get movie by ID
  async getMovieById(id) {
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
    
    return movie;
  }
  
  // Create new movie
  async createMovie(movieData, genreIds = []) {
    const movie = await Movie.create(movieData);
    
    if (genreIds && genreIds.length > 0) {
      await this.setMovieGenres(movie.id, genreIds);
    }
    
    return await this.getMovieById(movie.id);
  }
  
  // Update movie
  async updateMovie(id, movieData, genreIds = null) {
    const movie = await this.getMovieById(id);
    
    await movie.update(movieData);
    
    if (genreIds !== null) {
      await this.setMovieGenres(id, genreIds);
    }
    
    return await this.getMovieById(id);
  }
  
  // Delete movie
  async deleteMovie(id) {
    const movie = await this.getMovieById(id);
    await movie.destroy();
    return true;
  }
  
  // Get movies with active showtimes
  async getMoviesWithActiveShowtimes(date, theaterId, page, size) {
    const offset = page * size;
    const limit = size;
    
    // This would need to be implemented with Showtime model
    // For now, return all movies
    const { count, rows } = await Movie.findAndCountAll({
      include: [{
        model: Genre,
        as: 'genres',
        through: { attributes: [] }
      }],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      distinct: true
    });
    
    return {
      content: rows,
      totalElements: count,
      totalPages: Math.ceil(count / size),
      size,
      number: page,
      first: page === 0,
      last: page >= Math.ceil(count / size) - 1,
      numberOfElements: rows.length
    };
  }
  
  // Set movie genres
  async setMovieGenres(movieId, genreIds) {
    // Remove existing associations
    await MovieGenre.destroy({
      where: { movieId }
    });
    
    // Add new associations
    if (genreIds && genreIds.length > 0) {
      const associations = genreIds.map(genreId => ({
        movieId,
        genreId
      }));
      
      await MovieGenre.bulkCreate(associations);
    }
  }
  
  // Get all genres
  async getAllGenres() {
    return await Genre.findAll({
      order: [['name', 'ASC']]
    });
  }
  
  // Get genres by IDs
  async getGenresByIds(genreIds) {
    return await Genre.findAll({
      where: {
        id: {
          [Op.in]: genreIds
        }
      }
    });
  }
}

export default new MovieService();
