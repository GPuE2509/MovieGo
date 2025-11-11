const express = require("express");
const router = express.Router();
const sidebarManagementController = require("../controllers/sidebarManagementController");

/**
 * @swagger
 * tags:
 *   name: SidebarManagement
 *   description: Quản lý nội dung sidebar (carousel, festival)
 */

/**
 * @swagger
 * /api/v1/promotions/carousel:
 *   get:
 *     summary: Lấy danh sách khuyến mãi cho carousel
 *     tags: [SidebarManagement]
 *     responses:
 *       200:
 *         description: Danh sách khuyến mãi
 */

/**
 * @swagger
 * /api/v1/news/carousel:
 *   get:
 *     summary: Lấy danh sách tin tức cho carousel
 *     tags: [SidebarManagement]
 *     responses:
 *       200:
 *         description: Danh sách tin tức
 */

/**
 * @swagger
 * /api/v1/festivals/top:
 *   get:
 *     summary: Lấy danh sách lễ hội nổi bật
 *     tags: [SidebarManagement]
 *     responses:
 *       200:
 *         description: Danh sách lễ hội nổi bật
 */

/**
 * Sidebar Management Routes
 * Public APIs for managing sidebar content
 */

// Get promotions for carousel
// GET /api/v1/promotions/carousel
router.get(
  "/promotions/carousel",
  sidebarManagementController.getPromotionsForCarousel
);

// Get news for carousel
// GET /api/v1/news/carousel
router.get(
  "/news/carousel",
  sidebarManagementController.getNewsForCarousel
);

// Get top festivals
// GET /api/v1/festivals/top
router.get(
  "/festivals/top",
  sidebarManagementController.getTopFestivals
);

module.exports = router;
