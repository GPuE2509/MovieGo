const express = require("express");
const router = express.Router();
const recommendationController = require("../controllers/recommendationController");
const optionalAuth = require("../middleware/optionalAuth");

/**
 * @swagger
 * tags:
 *   name: Recommendations
 *   description: Đề xuất phim cho người dùng
 */

/**
 * @swagger
 * /api/v1/recommendations:
 *   get:
 *     summary: Lấy danh sách phim đề xuất
 *     tags: [Recommendations]
 *     responses:
 *       200:
 *         description: Danh sách phim đề xuất
 */

// GET /api/v1/recommendations
router.get("/recommendations", optionalAuth, (req, res) =>
  recommendationController.getRecommendations(req, res)
);

module.exports = router;


