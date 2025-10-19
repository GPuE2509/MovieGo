const express = require("express");
const router = express.Router();
const festivalController = require("../../controllers/festivalController");
const upload = require("../../middleware/upload");
const { auth, adminMiddleware } = require("../../middleware/auth");
const {
  festivalQueryValidation,
  createFestivalValidation,
  updateFestivalValidation,
  festivalIdValidation,
} = require("../../dto/request/festivalDto");

// Get all festivals (admin) - with pagination and search
router.get(
  "/festivals",
  auth,
  adminMiddleware,
  festivalQueryValidation,
  festivalController.getAllFestivals
);

// Get festival by ID (admin)
router.get(
  "/festival/:id",
  auth,
  adminMiddleware,
  festivalIdValidation,
  festivalController.getFestivalDetail
);

// Create festival (admin) - multipart/form-data
router.post(
  "/festival/create",
  auth,
  adminMiddleware,
  upload.single("image"),
  createFestivalValidation,
  festivalController.createFestival
);

// Update festival (admin)
router.put(
  "/festival/update/:id",
  auth,
  adminMiddleware,
  // Accept multipart/form-data without files
  upload.single("image"),
  updateFestivalValidation,
  festivalController.updateFestival
);

// Update festival image (admin) - multipart/form-data (use PUT)
router.put(
  "/user/update-festival-image/:id",
  auth,
  adminMiddleware,
  upload.single("image"),
  festivalIdValidation,
  festivalController.updateImageFestival
);

// Delete festival (admin)
router.delete(
  "/festival/delete/:id",
  auth,
  adminMiddleware,
  festivalIdValidation,
  festivalController.deleteFestival
);

// Get top festivals (admin)
router.get(
  "/festivals/top",
  auth,
  adminMiddleware,
  festivalController.getTopFestivals
);

module.exports = router;
