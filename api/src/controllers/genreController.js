const { validationResult } = require('express-validator');
const genreService = require('../services/genreService');

class GenreController {
  async list(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
      }
      const { search = '', page = 0, size = 10, sortField = 'genre_name', sortOrder = 'asc' } = req.query;
      const data = await genreService.list({ search, page: Number(page)||0, size: Number(size)||10, sortField, sortOrder });
      res.status(200).json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const data = await genreService.getById(req.params.id);
      res.status(200).json({ success: true, data });
    } catch (error) {
      if (error.message === 'Genre not found') return res.status(404).json({ success: false, message: 'Genre not found' });
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
      }
      const data = await genreService.create({ genre_name: req.body.genre_name });
      res.status(201).json({ success: true, data });
    } catch (error) {
      if (error.message === 'Genre name already exists') return res.status(400).json({ success: false, message: error.message });
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async update(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
      }
      const data = await genreService.update(req.params.id, { genre_name: req.body.genre_name });
      res.status(200).json({ success: true, data });
    } catch (error) {
      if (error.message === 'Genre not found') return res.status(404).json({ success: false, message: 'Genre not found' });
      if (error.message === 'Genre name already exists') return res.status(400).json({ success: false, message: error.message });
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async remove(req, res) {
    try {
      const ok = await genreService.remove(req.params.id);
      if (ok) return res.status(200).json({ success: true, message: 'Genre deleted successfully' });
      res.status(500).json({ success: false, message: 'Unknown error' });
    } catch (error) {
      if (error.message === 'Genre not found') return res.status(404).json({ success: false, message: 'Genre not found' });
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new GenreController();
