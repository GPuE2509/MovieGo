const { validationResult } = require('express-validator');
const theaterService = require('../services/theaterService');

class TheaterController {
  async getById(req, res) {
    try {
      const data = await theaterService.getById(req.params.id);
      res.status(200).json({ success: true, data });
    } catch (error) {
      if (error.message === 'Theater not found') return res.status(404).json({ success: false, message: 'Theater not found' });
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async list(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
      }
      const { search = '', city = '', page = 0, size = 10, sortField = 'created_at', sortOrder = 'desc', is_active } = req.query;
      const data = await theaterService.list({ search, city, page: Number(page)||0, size: Number(size)||10, sortField, sortOrder, is_active: (is_active !== undefined ? (is_active === true || is_active === 'true') : undefined) });
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
        name: req.body.name,
        address: req.body.address,
        city: req.body.city,
        phone: req.body.phone,
        email: req.body.email,
        is_active: req.body.is_active,
      };
      const data = await theaterService.create(payload);
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
        ...(req.body.name !== undefined ? { name: req.body.name } : {}),
        ...(req.body.address !== undefined ? { address: req.body.address } : {}),
        ...(req.body.city !== undefined ? { city: req.body.city } : {}),
        ...(req.body.phone !== undefined ? { phone: req.body.phone } : {}),
        ...(req.body.email !== undefined ? { email: req.body.email } : {}),
        ...(req.body.is_active !== undefined ? { is_active: req.body.is_active } : {}),
      };
      const data = await theaterService.update(req.params.id, payload);
      res.status(200).json({ success: true, data });
    } catch (error) {
      if (error.message === 'Theater not found') return res.status(404).json({ success: false, message: 'Theater not found' });
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async remove(req, res) {
    try {
      const ok = await theaterService.remove(req.params.id);
      if (ok) return res.status(200).json({ success: true, message: 'Theater deleted successfully' });
      res.status(500).json({ success: false, message: 'Unknown error' });
    } catch (error) {
      if (error.message === 'Theater not found') return res.status(404).json({ success: false, message: 'Theater not found' });
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new TheaterController();
