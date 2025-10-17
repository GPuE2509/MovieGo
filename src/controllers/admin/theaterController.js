import theaterService from '../../services/theaterService.js';

class AdminTheaterController {
  // Get all theaters with pagination (Admin API)
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

  // Get theater by ID (Admin API)
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

  // Create new theater (Admin API)
  async createTheater(req, res) {
    try {
      const { name, location, phone, latitude, longitude, state } = req.body;
      const imageFile = req.file; // From multer middleware
      
      const theater = await theaterService.createTheater(
        { name, location, phone, latitude, longitude, state },
        imageFile
      );
      
      res.status(201).json({
        status: 201,
        code: 201,
        data: theater
      });
    } catch (error) {
      if (error.message.includes('already exists')) {
        return res.status(409).json({
          status: 409,
          code: 409,
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

  // Update theater (Admin API)
  async updateTheater(req, res) {
    try {
      const { id } = req.params;
      const { name, location, phone, latitude, longitude, state } = req.body;
      const imageFile = req.file; // From multer middleware
      
      const theater = await theaterService.updateTheater(
        id,
        { name, location, phone, latitude, longitude, state },
        imageFile
      );
      
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
      
      if (error.message.includes('already exists')) {
        return res.status(409).json({
          status: 409,
          code: 409,
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

  // Delete theater (Admin API)
  async deleteTheater(req, res) {
    try {
      const { id } = req.params;
      
      await theaterService.deleteTheater(id);
      
      res.status(204).json({
        status: 204,
        code: 204,
        message: 'Theater deleted successfully'
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
}

export default new AdminTheaterController();
