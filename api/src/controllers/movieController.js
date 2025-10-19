const movieService = require('../services/movieService');
const cloudinary = require('../config/cloudinary');
const { validationResult } = require('express-validator');

class MovieController {
  async getAllMovies(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { title, author, sortBy = 'created_at', page = 0, size = 10 } = req.query;
      const pageNum = Number(page) || 0;
      const sizeNum = Math.min(Math.max(Number(size) || 10, 1), 100);

      const data = await movieService.getAllMovies(title, author, sortBy, pageNum, sizeNum);

      res.status(200).json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getMovieById(req, res) {
    try {
      const movie = await movieService.getMovieById(req.params.id);
      res.status(200).json({ success: true, data: movie });
    } catch (error) {
      if (error.message === 'Movie not found') {
        return res.status(404).json({ success: false, message: 'Movie not found' });
      }
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async createMovie(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
      }

      const movieData = { ...req.body };
      if (movieData.releaseDate && !movieData.release_date) {
        movieData.release_date = movieData.releaseDate;
        delete movieData.releaseDate;
      }

      // genreIds can come as array or comma-separated
      let { genreIds } = movieData;
      if (typeof genreIds === 'string') {
        try { genreIds = JSON.parse(genreIds); } catch (_) { genreIds = genreIds.split(',').map(s => s.trim()); }
      }

      if (req.file) {
        const buffer = req.file.buffer;
        const uploadStream = () => new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream({ resource_type: 'image', folder: 'movies' }, (err, result) => {
            if (err) return reject(err);
            resolve(result);
          });
          stream.end(buffer);
        });
        try {
          const result = await uploadStream();
          movieData.image = result.secure_url;
        } catch (err) {
          return res.status(500).json({ success: false, message: 'Error uploading image to Cloudinary' });
        }
      }

      const movie = await movieService.createMovie(movieData, genreIds);
      res.status(201).json({ success: true, data: movie });
    } catch (error) {
      if (typeof error.message === 'string' && error.message.startsWith('Invalid genres')) {
        return res.status(400).json({ success: false, message: error.message });
      }
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async updateMovie(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
      }

      const movieData = { ...req.body };
      if (movieData.releaseDate && !movieData.release_date) {
        movieData.release_date = movieData.releaseDate;
        delete movieData.releaseDate;
      }

      let { genreIds } = movieData;
      if (typeof genreIds === 'string') {
        try { genreIds = JSON.parse(genreIds); } catch (_) { genreIds = genreIds.split(',').map(s => s.trim()); }
      }

      const movie = await movieService.updateMovie(req.params.id, movieData, genreIds);
      res.status(200).json({ success: true, data: movie });
    } catch (error) {
      if (error.message === 'Movie not found') {
        return res.status(404).json({ success: false, message: 'Movie not found' });
      }
      if (typeof error.message === 'string' && error.message.startsWith('Invalid genres')) {
        return res.status(400).json({ success: false, message: error.message });
      }
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async updateMovieImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Image file cannot be empty' });
      }

      const buffer = req.file.buffer;
      const uploadStream = () => new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ resource_type: 'image', folder: `movies/${req.params.id}` }, (err, result) => {
          if (err) return reject(err);
          resolve(result);
        });
        stream.end(buffer);
      });

      const result = await uploadStream();
      const movie = await movieService.updateMovie(req.params.id, { image: result.secure_url });
      res.status(200).json({ success: true, data: movie });
    } catch (error) {
      if (error.message === 'Movie not found') {
        return res.status(404).json({ success: false, message: 'Movie not found' });
      }
      res.status(400).json({ success: false, message: `Failed to upload image: ${error.message}` });
    }
  }

  async deleteMovie(req, res) {
    try {
      await movieService.deleteMovie(req.params.id);
      res.status(200).json({ success: true, message: 'Movie deleted successfully' });
    } catch (error) {
      if (error.message === 'Movie not found') {
        return res.status(404).json({ success: false, message: 'Movie not found' });
      }
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new MovieController();
