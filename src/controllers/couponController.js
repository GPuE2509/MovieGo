import couponService from '../services/couponService.js';

class CouponController {
  // Get all coupons (Admin)
  async getAllCoupons(req, res) {
    try {
      const {
        page = 0,
        pageSize = 10,
        sortField = 'name',
        sortOrder = 'asc',
        search = ''
      } = req.query;
      
      const result = await couponService.getAllCoupons(
        parseInt(page),
        parseInt(pageSize),
        sortField,
        sortOrder,
        search
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

  // Create new coupon (Admin)
  async createCoupon(req, res) {
    try {
      await couponService.createCoupon(req.body);
      
      res.status(201).json({
        status: 201,
        code: 201,
        data: 'Coupon created successfully'
      });
    } catch (error) {
      if (error.message === 'Coupon code already exists') {
        return res.status(400).json({
          status: 400,
          code: 400,
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

  // Update coupon (Admin)
  async updateCoupon(req, res) {
    try {
      const { id } = req.params;
      
      await couponService.updateCoupon(id, req.body);
      
      res.status(200).json({
        status: 200,
        code: 200,
        data: 'Coupon updated successfully'
      });
    } catch (error) {
      if (error.message === 'Coupon not found') {
        return res.status(404).json({
          status: 404,
          code: 404,
          message: error.message
        });
      }
      
      if (error.message === 'Coupon code already exists') {
        return res.status(400).json({
          status: 400,
          code: 400,
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

  // Delete coupon (Admin)
  async deleteCoupon(req, res) {
    try {
      const { id } = req.params;
      
      await couponService.deleteCoupon(id);
      
      res.status(204).json({
        status: 204,
        code: 204,
        data: 'Coupon deleted successfully'
      });
    } catch (error) {
      if (error.message === 'Coupon not found') {
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

  // Get available coupons for user
  async getAvailableCoupons(req, res) {
    try {
      const { userId } = req.params;
      
      const coupons = await couponService.getAvailableCouponsForUser(userId);
      
      res.status(200).json({
        status: 200,
        code: 200,
        data: coupons
      });
    } catch (error) {
      if (error.message === 'User not found') {
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

  // Get user's coupons
  async getMyCoupons(req, res) {
    try {
      const { userId } = req.params;
      
      const coupons = await couponService.getUserCoupons(userId);
      
      res.status(200).json({
        status: 200,
        code: 200,
        data: coupons
      });
    } catch (error) {
      if (error.message === 'User not found') {
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

  // Exchange coupon
  async exchangeCoupon(req, res) {
    try {
      const { couponId, userId } = req.params;
      
      await couponService.exchangeCoupon(userId, couponId);
      
      res.status(200).json({
        status: 200,
        code: 200,
        data: 'Coupon exchanged successfully!'
      });
    } catch (error) {
      if (error.message === 'User not found' || error.message === 'Coupon not found') {
        return res.status(404).json({
          status: 404,
          code: 404,
          message: error.message
        });
      }
      
      if (error.message === 'Insufficient points to exchange this coupon' || 
          error.message === 'You already have this coupon') {
        return res.status(400).json({
          status: 400,
          code: 400,
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

  // Check if user can exchange coupon
  async canExchangeCoupon(req, res) {
    try {
      const { couponId, userId } = req.params;
      
      const canExchange = await couponService.canExchangeCoupon(userId, couponId);
      
      res.status(200).json({
        status: 200,
        code: 200,
        data: canExchange
      });
    } catch (error) {
      if (error.message === 'User not found' || error.message === 'Coupon not found') {
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

export default new CouponController();
