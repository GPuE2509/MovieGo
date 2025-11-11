const express = require("express");
const router = express.Router();
const promotionManagementController = require("../../controllers/promotionManagementController");
const {
  auth,
  adminMiddleware
} = require("../../middleware/auth");
const {
  promotionQueryValidation,
  createPromotionValidation,
  updatePromotionValidation,
  promotionIdValidation,
} = require("../../dto/request/promotionDto");

/**
 * @swagger
 * tags:
 *   name: AdminPromotion
 *   description: Quản lý khuyến mãi (Admin)
 */

/**
 * @swagger
 * /api/v1/admin/promotions:
 *   get:
 *     summary: Lấy danh sách khuyến mãi
 *     tags: [AdminPromotion]
 *     responses:
 *       200:
 *         description: Danh sách khuyến mãi
 */

/**
 * @swagger
 * /api/v1/admin/promotion/{id}:
 *   get:
 *     summary: Lấy thông tin khuyến mãi theo ID
 *     tags: [AdminPromotion]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thông tin khuyến mãi
 *       404:
 *         description: Không tìm thấy khuyến mãi
 */

/**
 * @swagger
 * /api/v1/admin/promotion/create:
 *   post:
 *     summary: Tạo khuyến mãi mới
 *     tags: [AdminPromotion]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                  title:
 *                 type: string
 *               description:
 *                 type: string
 *                discount_amount: / discount_percentage:
 *                type: number
              start_date:
  *                type: string
              end_date:
  *                type: string
                status:
  *                 type: boolean
 *     responses:
 *       201:
 *         description: Tạo khuyến mãi thành công
 */

/**
 * @swagger
 * /api/v1/admin/promotion/update/{id}:
 *   put:
 *     summary: Cập nhật khuyến mãi
 *     tags: [AdminPromotion]
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
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật khuyến mãi thành công
 */

/**
 * @swagger
 * /api/v1/admin/promotion/delete/{id}:
 *   delete:
 *     summary: Xóa khuyến mãi
 *     tags: [AdminPromotion]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xóa khuyến mãi thành công
 *       404:
 *         description: Không tìm thấy khuyến mãi
 */

// Get all promotions (admin) - with pagination, search and filters
router.get(
  "/promotions",
  auth,
  adminMiddleware,
  promotionQueryValidation,
  promotionManagementController.getAllPromotions
);

// Get promotion by ID (admin)
router.get(
  "/promotion/:id",
  auth,
  adminMiddleware,
  promotionIdValidation,
  promotionManagementController.getPromotionById
);

// Create new promotion (admin)
router.post(
  "/promotion/create",
  auth,
  adminMiddleware,
  createPromotionValidation,
  promotionManagementController.createPromotion
);

// Update promotion (admin)
router.put(
  "/promotion/update/:id",
  auth,
  adminMiddleware,
  updatePromotionValidation,
  promotionManagementController.updatePromotion
);

// Delete promotion (admin)
router.delete(
  "/promotion/delete/:id",
  auth,
  adminMiddleware,
  promotionIdValidation,
  promotionManagementController.deletePromotion
);

module.exports = router;