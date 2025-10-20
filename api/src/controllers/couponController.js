const { validationResult } = require('express-validator');
const couponService = require('../services/couponService');

class CouponController {
  async list(req, res) {
    try {
      const data = await couponService.list();
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
      const data = await couponService.create(req.body);
      res.status(201).json({ success: true, data });
    } catch (error) {
      if (error.message === 'Coupon code already exists') return res.status(400).json({ success: false, message: error.message });
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async update(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
      }
      const data = await couponService.update(req.params.id, req.body);
      res.status(200).json({ success: true, data });
    } catch (error) {
      if (error.message === 'Coupon not found') return res.status(404).json({ success: false, message: 'Coupon not found' });
      if (error.message === 'Coupon code already exists') return res.status(400).json({ success: false, message: error.message });
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async remove(req, res) {
    try {
      const ok = await couponService.remove(req.params.id);
      if (ok) return res.status(200).json({ success: true, message: 'Coupon deleted successfully' });
      res.status(500).json({ success: false, message: 'Unknown error' });
    } catch (error) {
      if (error.message === 'Coupon not found') return res.status(404).json({ success: false, message: 'Coupon not found' });
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new CouponController();
