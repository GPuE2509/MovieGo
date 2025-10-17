import genreService from '../../services/genreService.js';

class AdminGenreController {
  // Get all genres (Admin API)
  async getAllGenres(req, res) {
    try {
      const genres = await genreService.getAllGenres();
      
      // Convert to response format
      const response = genres.map(genre => ({
        id: genre.id,
        genreName: genre.name
      }));
      
      res.status(200).json({
        status: 200,
        code: 200,
        data: response
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        code: 500,
        message: error.message
      });
    }
  }

  // Add new genre (Admin API)
  async addGenre(req, res) {
    try {
      const { genreName } = req.body;
      
      const genre = await genreService.addGenre({
        name: genreName
      });
      
      const response = {
        id: genre.id,
        genreName: genre.name
      };
      
      res.status(201).json({
        status: 201,
        code: 201,
        data: response
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

  // Update genre (Admin API)
  async updateGenre(req, res) {
    try {
      const { id } = req.params;
      const { genreName } = req.body;
      
      const genre = await genreService.updateGenre(id, {
        name: genreName
      });
      
      const response = {
        id: genre.id,
        genreName: genre.name
      };
      
      res.status(200).json({
        status: 200,
        code: 200,
        data: response
      });
    } catch (error) {
      if (error.message === 'Genre not found') {
        return res.status(404).json({
          status: 404,
          code: 404,
          message: 'Genre not found'
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

  // Delete genre (Admin API)
  async deleteGenre(req, res) {
    try {
      const { id } = req.params;
      
      await genreService.deleteGenre(id);
      
      res.status(204).json({
        status: 204,
        code: 204,
        message: 'Genre deleted successfully'
      });
    } catch (error) {
      if (error.message === 'Genre not found') {
        return res.status(404).json({
          status: 404,
          code: 404,
          message: 'Genre not found'
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

export default new AdminGenreController();
