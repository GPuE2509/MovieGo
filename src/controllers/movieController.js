import movieService from '../services/movieService.js';

class MovieController {
  // Get movies with active showtimes (Public API)
  async getMoviesWithShowtimes(req, res) {
    try {
      const { date, theaterId, page, size } = req.query;
      
      const result = await movieService.getMoviesWithActiveShowtimes(
        date, 
        theaterId, 
        page, 
        size
      );
      
      res.status(200).json({
        status: 200,
        code: 200,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        code: 500,
        message: error.message
      });
    }
  }
  
  // Get movie details (Public API)
  async getMovieDetails(req, res) {
    try {
      const { id } = req.params;
      
      const movie = await movieService.getMovieById(id);
      
      res.status(200).json({
        status: 200,
        code: 200,
        data: movie
      });
    } catch (error) {
      if (error.message === 'Movie not found') {
        return res.status(404).json({
          status: 404,
          code: 404,
          message: 'Movie not found'
        });
      }
      
      res.status(500).json({
        status: 500,
        code: 500,
        message: error.message
      });
    }
  }
}

export default new MovieController();
