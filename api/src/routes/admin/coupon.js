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
 *             properties:
 *               code:
 *                 type: string
 *               discount:
 *                 type: number
 *     responses:
 *       201:
 *         description: Tạo coupon thành công
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *               discount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Cập nhật coupon thành công
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
