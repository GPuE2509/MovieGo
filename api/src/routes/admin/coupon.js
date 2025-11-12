const express = require('express');
const router = express.Router();
const couponController = require('../../controllers/couponController');
const { auth, adminMiddleware } = require('../../middleware/auth');
const { createCouponValidation, updateCouponValidation } = require('../../dto/request/couponDto');

/**
 * @swagger
 * tags:
 *   name: AdminCoupon
 *   description: Quản lý coupon (Admin)
 */

/**
 * @swagger
 * /api/v1/admin/coupons:
 *   get:
 *     summary: Lấy danh sách coupon
 *     tags: [AdminCoupon]
 *     responses:
 *       200:
 *         description: Danh sách coupon
 */

/**
 * @swagger
 * /api/v1/admin/coupon/create:
 *   post:
 *     summary: Tạo coupon mới
 *     tags: [AdminCoupon]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [coupon_code, discount_percentage, min_order_amount, max_discount_amount, usage_limit, start_date, end_date, is_active]
 *             properties:
 *               coupon_code:
 *                 type: string
 *                 example: WELCOME10
 *               discount_percentage:
 *                 type: number
 *                 format: float
 *                 example: 10
 *               min_order_amount:
 *                 type: number
 *                 example: 100000
 *               max_discount_amount:
 *                 type: number
 *                 example: 50000
 *               usage_limit:
 *                 type: integer
 *                 example: 1000
 *               used_count:
 *                 type: integer
 *                 description: Số lần đã sử dụng (thường hệ thống tự quản lý)
 *                 example: 0
 *               start_date:
 *                 type: string
 *                 format: date-time
 *                 example: 2025-10-01T00:00:00.000Z
 *               end_date:
 *                 type: string
 *                 format: date-time
 *                 example: 2025-12-31T23:59:59.000Z
 *               is_active:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Tạo coupon thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: ObjectId
 *                   example: 68f5baa490ce1ea7b01507f8
 *                 coupon_code:
 *                   type: string
 *                   example: WELCOME10
 *                 discount_percentage:
 *                   type: number
 *                   example: 10
 *                 min_order_amount:
 *                   type: number
 *                   example: 100000
 *                 max_discount_amount:
 *                   type: number
 *                   example: 50000
 *                 usage_limit:
 *                   type: integer
 *                   example: 1000
 *                 used_count:
 *                   type: integer
 *                   example: 0
 *                 start_date:
 *                   type: string
 *                   format: date-time
 *                   example: 2025-10-01T00:00:00.000Z
 *                 end_date:
 *                   type: string
 *                   format: date-time
 *                   example: 2025-12-31T23:59:59.000Z
 *                 is_active:
 *                   type: boolean
 *                   example: true
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                 updated_at:
 *                   type: string
 *                   format: date-time
 */

/**
 * @swagger
 * /api/v1/admin/coupon/update/{id}:
 *   put:
 *     summary: Cập nhật coupon
 *     tags: [AdminCoupon]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: ^[a-fA-F0-9]{24}$
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               coupon_code:
 *                 type: string
 *               discount_percentage:
 *                 type: number
 *                 format: float
 *               min_order_amount:
 *                 type: number
 *               max_discount_amount:
 *                 type: number
 *               usage_limit:
 *                 type: integer
 *               used_count:
 *                 type: integer
 *                 description: Số lần đã sử dụng (thường hệ thống tự quản lý)
 *               start_date:
 *                 type: string
 *                 format: date-time
 *               end_date:
 *                 type: string
 *                 format: date-time
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Cập nhật coupon thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: ObjectId
 *                   example: 68f5baa490ce1ea7b01507f8
 *                 coupon_code:
 *                   type: string
 *                 discount_percentage:
 *                   type: number
 *                 min_order_amount:
 *                   type: number
 *                 max_discount_amount:
 *                   type: number
 *                 usage_limit:
 *                   type: integer
 *                 used_count:
 *                   type: integer
 *                 start_date:
 *                   type: string
 *                   format: date-time
 *                 end_date:
 *                   type: string
 *                   format: date-time
 *                 is_active:
 *                   type: boolean
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                 updated_at:
 *                   type: string
 *                   format: date-time
 */

/**
 * @swagger
 * /api/v1/admin/coupon/delete/{id}:
 *   delete:
 *     summary: Xóa coupon
 *     tags: [AdminCoupon]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xóa coupon thành công
 *       404:
 *         description: Không tìm thấy coupon
 */

// Get all coupons
router.get('/coupons', auth, adminMiddleware, couponController.list);

// Create a coupon
router.post('/coupon/create', auth, adminMiddleware, createCouponValidation, couponController.create);

// Update a coupon
router.put('/coupon/update/:id', auth, adminMiddleware, updateCouponValidation, couponController.update);

// Delete a coupon
router.delete('/coupon/delete/:id', auth, adminMiddleware, couponController.remove);

module.exports = router;
