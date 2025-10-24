const express = require("express");
const router = express.Router();
const sidebarManagementController = require("../controllers/sidebarManagementController");

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
