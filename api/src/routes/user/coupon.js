const express = require('express');
const router = express.Router();
const userCouponController = require('../../controllers/userCouponController');
const { auth } = require('../../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: UserCoupon
 *   description: Quản lý coupon của người dùng
 */

/**
 * @swagger
 * /api/v1/user/my-coupons/{userId}:
 *   get:
 *     summary: Lấy danh sách coupon của người dùng
 *     tags: [UserCoupon]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Danh sách coupon
 */

/**
 * @swagger
 * /api/v1/user/available-coupons/{userId}:
 *   get:
 *     summary: Lấy danh sách coupon có thể đổi
 *     tags: [UserCoupon]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Danh sách coupon có thể đổi
 */

/**
 * @swagger
 * /api/v1/user/can-exchange/{couponId}/{userId}:
 *   get:
 *     summary: Kiểm tra khả năng đổi coupon
 *     tags: [UserCoupon]
 *     parameters:
 *       - in: path
 *         name: couponId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Kết quả kiểm tra
 */

/**
 * @swagger
 * /api/v1/user/exchange/{couponId}/{userId}:
 *   post:
 *     summary: Đổi coupon
 *     tags: [UserCoupon]
 *     parameters:
 *       - in: path
 *         name: couponId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Đổi coupon thành công
 */

// User: my coupons
router.get('/my-coupons/:userId', auth, userCouponController.myCoupons);

// User: available coupons to exchange
router.get('/available-coupons/:userId', auth, userCouponController.availableCoupons);

// User: can exchange?
router.get('/can-exchange/:couponId/:userId', auth, userCouponController.canExchange);

// User: exchange
router.post('/exchange/:couponId/:userId', auth, userCouponController.exchange);

module.exports = router;
