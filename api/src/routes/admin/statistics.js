const express = require("express");
const router = express.Router();
const statisticsController = require("../../controllers/statisticsController");
const { auth, adminMiddleware } = require("../../middleware/auth");

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