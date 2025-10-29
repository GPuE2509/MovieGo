const { validationResult } = require('express-validator');
const couponService = require('../services/couponService');

class CouponController {
  async list(req, res) {
    try {
      const { page = '0', pageSize = '10', sortField = 'coupon_name', sortOrder = 'asc', search = '' } = req.query;
      const data = await couponService.list({ page, pageSize, sortField, sortOrder, search });
      res.status(200).json({ status: 200, code: 200, data });
    } catch (error) {
      res.status(500).json({ status: 500, code: 500, message: error.message });
    }
  }

  async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ status: 400, code: 400, message: 'Validation failed', errors: errors.array() });
      }
      const data = await couponService.create(req.body);
      res.status(201).json({ status: 201, code: 201, data: 'Coupon created successfully' });
    } catch (error) {
      if (error.message === 'Coupon code already exists') return res.status(400).json({ status: 400, code: 400, message: error.message });
      res.status(500).json({ status: 500, code: 500, message: error.message });
    }
  }

  async update(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ status: 400, code: 400, message: 'Validation failed', errors: errors.array() });
      }
      const data = await couponService.update(req.params.id, req.body);
      res.status(200).json({ status: 200, code: 200, data: 'Coupon updated successfully' });
    } catch (error) {
      if (error.message === 'Coupon not found') return res.status(404).json({ status: 404, code: 404, message: 'Coupon not found' });
      if (error.message === 'Coupon code already exists') return res.status(400).json({ status: 400, code: 400, message: error.message });
      res.status(500).json({ status: 500, code: 500, message: error.message });
    }
  }

  async remove(req, res) {
    try {
      const ok = await couponService.remove(req.params.id);
      if (ok) return res.status(204).json({ status: 204, code: 204, data: 'Coupon deleted successfully' });
      res.status(500).json({ status: 500, code: 500, message: 'Unknown error' });
    } catch (error) {
      if (error.message === 'Coupon not found') return res.status(404).json({ status: 404, code: 404, message: 'Coupon not found' });
      res.status(500).json({ status: 500, code: 500, message: error.message });
    }
  }
}

module.exports = new CouponController();
