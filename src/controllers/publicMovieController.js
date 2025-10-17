import publicMovieService from '../services/publicMovieService.js';

class PublicMovieController {
  // Get movies with active showtimes
  async getMoviesWithShowtimes(req, res) {
    try {
      const {
        date = null,
        theaterId = null,
        page = 0,
        size = 10
      } = req.query;
      
      const result = await publicMovieService.getMoviesWithActiveShowtimes(
        parseInt(page),
        parseInt(size),
        date ? new Date(date) : null,
        theaterId ? parseInt(theaterId) : null
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

  // Get movie details by ID
  async getMovieDetails(req, res) {
    try {
      const { id } = req.params;
      
      const movie = await publicMovieService.getMovieDetails(id);
      
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

  // Get movies showing (for home page)
  async getMoviesShowing(req, res) {
    try {
      const now = req.query.now ? new Date(req.query.now) : new Date();
      
      const movies = await publicMovieService.getMoviesShowing(now);
      
      res.status(200).json({
        status: 200,
        code: 200,
        data: movies
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        code: 500,
        message: error.message
      });
    }
  }

  // Get movies coming soon
  async getMoviesComing(req, res) {
    try {
      const now = req.query.now ? new Date(req.query.now) : new Date();
      
      const movies = await publicMovieService.getMoviesComing(now);
      
      res.status(200).json({
        status: 200,
        code: 200,
        data: movies
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        code: 500,
        message: error.message
      });
    }
  }

  // Get movie trailer
  async getMovieTrailer(req, res) {
    try {
      const { id } = req.params;
      
      const trailer = await publicMovieService.getMovieTrailer(id);
      
      res.status(200).json({
        status: 200,
        code: 200,
        data: trailer
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

export default new PublicMovieController();
