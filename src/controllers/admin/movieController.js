import movieService from '../../services/movieService.js';
import { cloudinary } from '../../config/cloudinary.js';

class AdminMovieController {
  // Get all movies (Admin API)
  async getAllMovies(req, res) {
    try {
      const { title, author, sortBy, page, size } = req.query;
      
      const result = await movieService.getAllMovies(
        title, 
        author, 
        sortBy, 
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
  
  // Get movie by ID (Admin API)
  async getMovieById(req, res) {
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
  
  // Create new movie (Admin API)
  async createMovie(req, res) {
    try {
      const movieData = req.body;
      const { genreIds } = movieData;
      
      // Handle image upload if present
      if (req.file) {
        try {
          const result = await cloudinary.uploader.upload(req.file.path, {
            resource_type: 'image',
            folder: 'movies'
          });
          movieData.image = result.secure_url;
        } catch (uploadError) {
          return res.status(500).json({
            status: 500,
            code: 500,
            message: 'Error uploading image to Cloudinary'
          });
        }
      }
      
      const movie = await movieService.createMovie(movieData, genreIds);
      
      res.status(201).json({
        status: 201,
        code: 201,
        data: movie
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        code: 500,
        message: error.message
      });
    }
  }
  
  // Update movie details (Admin API)
  async updateMovie(req, res) {
    try {
      const { id } = req.params;
      const movieData = req.body;
      const { genreIds } = movieData;
      
      const movie = await movieService.updateMovie(id, movieData, genreIds);
      
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
  
  // Update movie image (Admin API)
  async updateMovieImage(req, res) {
    try {
      const { id } = req.params;
      
      if (!req.file) {
        return res.status(400).json({
          status: 400,
          code: 400,
          message: 'Image file cannot be empty'
        });
      }
      
      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        resource_type: 'image',
        folder: `movies/${id}`,
        public_id: req.file.originalname.replace(/\s+/g, '_')
      });
      
      // Update movie with new image URL
      const movie = await movieService.updateMovie(id, {
        image: result.secure_url
      });
      
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
      
      res.status(400).json({
        status: 400,
        code: 400,
        message: `Failed to upload image: ${error.message}`
      });
    }
  }
  
  // Delete movie (Admin API)
  async deleteMovie(req, res) {
    try {
      const { id } = req.params;
      
      await movieService.deleteMovie(id);
      
      res.status(200).json({
        status: 200,
        code: 200,
        message: 'Movie deleted successfully'
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

export default new AdminMovieController();
