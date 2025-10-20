const movieSelectionService = require('../services/movieSelectionService');

class MovieSelectionController {
  async getMovies(req, res) {
    try {
      const data = await movieSelectionService.getMoviesWithActiveShowtimes();
      res.status(200).json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getMovieById(req, res) {
    try {
      const data = await movieSelectionService.getMovieDetail(req.params.id);
      res.status(200).json({ success: true, data });
    } catch (error) {
      if (error.message === 'Movie not found') return res.status(404).json({ success: false, message: 'Movie not found' });
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new MovieSelectionController();
