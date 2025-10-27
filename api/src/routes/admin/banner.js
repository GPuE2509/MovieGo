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
