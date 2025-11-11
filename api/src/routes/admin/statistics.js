const express = require("express");
const router = express.Router();
const statisticsController = require("../../controllers/statisticsController");
const { auth, adminMiddleware } = require("../../middleware/auth");

/**
 * @swagger
 * tags:
 *   name: AdminStatistics
 *   description: Thống kê hệ thống (Admin)
 */

/**
 * @swagger
 * /api/v1/admin/statistics/users:
 *   get:
 *     summary: Thống kê người dùng
 *     tags: [AdminStatistics]
 *     responses:
 *       200:
 *         description: Thống kê người dùng
 */

/**
 * @swagger
 * /api/v1/admin/statistics/tickets:
 *   get:
 *     summary: Thống kê vé
 *     tags: [AdminStatistics]
 *     responses:
 *       200:
 *         description: Thống kê vé
 */

/**
 * @swagger
 * /api/v1/admin/statistics/suppliers:
 *   get:
 *     summary: Thống kê doanh thu nhà cung cấp
 *     tags: [AdminStatistics]
 *     responses:
 *       200:
 *         description: Thống kê doanh thu nhà cung cấp
 */

/**
 * @swagger
 * /api/v1/admin/statistics/revenue:
 *   get:
 *     summary: Thống kê doanh thu hệ thống
 *     tags: [AdminStatistics]
 *     responses:
 *       200:
 *         description: Thống kê doanh thu hệ thống
 */

/**
 * @swagger
 * /api/v1/admin/statistics/news-events:
 *   get:
 *     summary: Thống kê tin tức & sự kiện
 *     tags: [AdminStatistics]
 *     responses:
 *       200:
 *         description: Thống kê tin tức & sự kiện
 */

/**
 * @swagger
 * /api/v1/admin/statistics/movies:
 *   get:
 *     summary: Thống kê phim
 *     tags: [AdminStatistics]
 *     responses:
 *       200:
 *         description: Thống kê phim
 */

// Common middleware for all statistics routes
const statisticsMiddleware = [auth, adminMiddleware];

// Statistics routes
router.get("/statistics/users", ...statisticsMiddleware, statisticsController.getUserStatistics);
router.get("/statistics/tickets", ...statisticsMiddleware, statisticsController.getTicketStatistics);
router.get("/statistics/suppliers", ...statisticsMiddleware, statisticsController.getSupplierRevenueStatistics);
router.get("/statistics/revenue", ...statisticsMiddleware, statisticsController.getRevenueStatistics);
router.get("/statistics/news-events", ...statisticsMiddleware, statisticsController.getNewsEventStatistics);
router.get("/statistics/movies", ...statisticsMiddleware, statisticsController.getMovieStatistics);

module.exports = router;