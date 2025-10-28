const express = require("express");
const router = express.Router();
const recommendationController = require("../controllers/recommendationController");
const optionalAuth = require("../middleware/optionalAuth");

// GET /api/v1/recommendations
router.get("/recommendations", optionalAuth, (req, res) =>
  recommendationController.getRecommendations(req, res)
);

module.exports = router;


