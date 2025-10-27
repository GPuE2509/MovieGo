const express = require("express");
const router = express.Router();
const promotionManagementController = require("../../controllers/promotionManagementController");
const { auth, adminMiddleware } = require("../../middleware/auth");
const {
  promotionQueryValidation,
  createPromotionValidation,
  updatePromotionValidation,
  promotionIdValidation,
} = require("../../dto/request/promotionDto");

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
