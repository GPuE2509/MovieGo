const express = require("express");
const router = express.Router();
const bannerController = require("../../controllers/bannerController");
const { auth, adminMiddleware } = require("../../middleware/auth");
const {
  bannerQueryValidation,
  bannerIdValidation,
  createBannerValidation,
  updateBannerValidation,
} = require("../../dto/request/bannerDto");

// Common middleware for all banner routes
const bannerMiddleware = [auth, adminMiddleware];

/**
 * @swagger
 * tags:
 *   name: AdminBanner
 *   description: Quản lý banner (Admin)
 */

/**
 * @swagger
 * /api/v1/admin/banners:
 *   get:
 *     summary: Lấy danh sách banner
 *     tags: [AdminBanner]
 *     responses:
 *       200:
 *         description: Danh sách banner
 *   post:
 *     summary: Tạo banner mới
 *     tags: [AdminBanner]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               image:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tạo banner thành công
 */

/**
 * @swagger
 * /api/v1/admin/banners/{id}:
 *   get:
 *     summary: Lấy thông tin banner theo ID
 *     tags: [AdminBanner]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thông tin banner
 *       404:
 *         description: Không tìm thấy banner
 *   put:
 *     summary: Cập nhật banner
 *     tags: [AdminBanner]
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
 *               image:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật banner thành công
 *       404:
 *         description: Không tìm thấy banner
 */

// Banner routes
router.get(
  "/banners",
  ...bannerMiddleware,
  bannerQueryValidation,
  bannerController.getAllBanners
);

router.get(
  "/banners/:id",
  ...bannerMiddleware,
  bannerIdValidation,
  bannerController.getBannerById
);

router.post(
  "/banners",
  ...bannerMiddleware,
  createBannerValidation,
  bannerController.createBanner
);

router.put(
  "/banners/:id",
  ...bannerMiddleware,
  updateBannerValidation,
  bannerController.updateBanner
);

module.exports = router;
