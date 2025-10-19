const { validationResult } = require('express-validator');
const newsService = require('../services/newsService');

class NewsController {
  async list(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
      }
      const { search = '', page = 0, size = 10, sortField = 'created_at', sortOrder = 'desc' } = req.query;
      const data = await newsService.list({ search, page: Number(page)||0, size: Number(size)||10, sortField, sortOrder });
      res.status(200).json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
      }
      const payload = {
        title: req.body.title,
        content: req.body.content,
        author: req.body.author,
        image: req.body.image,
        is_published: req.body.is_published,
        published_at: req.body.published_at,
      };
      const data = await newsService.create(payload);
      res.status(201).json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async update(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
      }
      const payload = {
        ...(req.body.title !== undefined ? { title: req.body.title } : {}),
        ...(req.body.content !== undefined ? { content: req.body.content } : {}),
        ...(req.body.author !== undefined ? { author: req.body.author } : {}),
        ...(req.body.image !== undefined ? { image: req.body.image } : {}),
        ...(req.body.is_published !== undefined ? { is_published: req.body.is_published } : {}),
        ...(req.body.published_at !== undefined ? { published_at: req.body.published_at } : {}),
      };
      const data = await newsService.update(req.params.id, payload);
      res.status(200).json({ success: true, data });
    } catch (error) {
      if (error.message === 'News not found') return res.status(404).json({ success: false, message: 'News not found' });
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async remove(req, res) {
    try {
      const ok = await newsService.remove(req.params.id);
      if (ok) return res.status(200).json({ success: true, message: 'News deleted successfully' });
      res.status(500).json({ success: false, message: 'Unknown error' });
    } catch (error) {
      if (error.message === 'News not found') return res.status(404).json({ success: false, message: 'News not found' });
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new NewsController();
