import theaterService from '../services/theaterService.js';

class TheaterController {
  // Get all theaters with pagination (Public API)
  async getAllTheaters(req, res) {
    try {
      const {
        keyword = '',
        page = 0,
        size = 10,
        sortBy = 'name',
        direction = 'asc'
      } = req.query;
      
      const result = await theaterService.getAllTheaters(
        parseInt(page),
        parseInt(size),
        sortBy,
        direction,
        keyword
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

  // Get theater by ID (Public API)
  async getTheaterById(req, res) {
    try {
      const { id } = req.params;
      
      const theater = await theaterService.getTheaterById(id);
      
      res.status(200).json({
        status: 200,
        code: 200,
        data: theater
      });
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          status: 404,
          code: 404,
          message: error.message
        });
      }
      
      res.status(500).json({
        status: 500,
        code: 500,
        message: error.message
      });
    }
  }

  // Get theaters near a location (Public API)
  async getTheatersNear(req, res) {
    try {
      const { lat, lon, radius = 5, date, limit = 10 } = req.query;
      
      const theaters = await theaterService.getTheatersNear(
        parseFloat(lat),
        parseFloat(lon),
        parseFloat(radius),
        date,
        parseInt(limit)
      );
      
      res.status(200).json({
        status: 200,
        code: 200,
        data: theaters
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        code: 500,
        message: error.message
      });
    }
  }
}

export default new TheaterController();
