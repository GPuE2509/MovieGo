const userCouponService = require('../services/userCouponService');

class UserCouponController {
  async myCoupons(req, res) {
    try {
      const data = await userCouponService.getUserCoupons(req.params.userId);
      res.status(200).json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async availableCoupons(req, res) {
    try {
      const data = await userCouponService.getAvailableCoupons(req.params.userId);
      res.status(200).json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async canExchange(req, res) {
    try {
      const { userId, couponId } = req.params;
      const result = await userCouponService.canExchange(userId, couponId);
      res.status(200).json({ success: result.ok, data: result.ok ? true : false, message: result.ok ? undefined : result.reason });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async exchange(req, res) {
    try {
      const { userId, couponId } = req.params;
      await userCouponService.exchange(userId, couponId);
      res.status(200).json({ success: true, message: 'Coupon exchanged successfully' });
    } catch (error) {
      if (typeof error.message === 'string' && error.message.startsWith('Cannot exchange:')) {
        return res.status(400).json({ success: false, message: error.message });
      }
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new UserCouponController();
