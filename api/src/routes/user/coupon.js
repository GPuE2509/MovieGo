const express = require('express');
const router = express.Router();
const userCouponController = require('../../controllers/userCouponController');
const { auth } = require('../../middleware/auth');

// User: my coupons
router.get('/user/my-coupons/:userId', auth, userCouponController.myCoupons);

// User: available coupons to exchange
router.get('/user/available-coupons/:userId', auth, userCouponController.availableCoupons);

// User: can exchange?
router.get('/user/can-exchange/:couponId/:userId', auth, userCouponController.canExchange);

// User: exchange
router.post('/user/exchange/:couponId/:userId', auth, userCouponController.exchange);

module.exports = router;
