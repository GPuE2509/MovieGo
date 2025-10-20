const express = require('express');
const router = express.Router();
const couponController = require('../../controllers/couponController');
const { auth, adminMiddleware } = require('../../middleware/auth');
const { createCouponValidation, updateCouponValidation } = require('../../dto/request/couponDto');

// Get all coupons
router.get('/coupons', auth, adminMiddleware, couponController.list);

// Create a coupon
router.post('/coupon/create', auth, adminMiddleware, createCouponValidation, couponController.create);

// Update a coupon
router.put('/coupon/update/:id', auth, adminMiddleware, updateCouponValidation, couponController.update);

// Delete a coupon
router.delete('/coupon/delete/:id', auth, adminMiddleware, couponController.remove);

module.exports = router;
