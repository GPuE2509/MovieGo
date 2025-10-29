const express = require("express");
const router = express.Router();
const screenManagementController = require("../../controllers/screenManagementController");
const { auth, adminMiddleware } = require("../../middleware/auth");
const {
  screenQueryValidation,
  createScreenValidation,
  updateScreenValidation,
  updateScreenStatusValidation,
  screenIdValidation,
} = require("../../dto/request/screenDto");

// Get all screens (admin) - with pagination, search and filters
router.get(
  "/screens",
  auth,
  adminMiddleware,
  screenQueryValidation,
  screenManagementController.getAllScreens
);

// Get screen by ID (admin)
router.get(
  "/screen/:id",
  auth,
  adminMiddleware,
  screenIdValidation,
  screenManagementController.getScreenById
);

// Create new screen (admin)
router.post(
  "/screen/create",
  auth,
  adminMiddleware,
  createScreenValidation,
  screenManagementController.createScreen
);

// Update screen (admin)
router.put(
  "/screen/update/:id",
  auth,
  adminMiddleware,
  updateScreenValidation,
  screenManagementController.updateScreen
);

// Update screen status (admin)
router.patch(
  "/screen/update/status/:id",
  auth,
  adminMiddleware,
  updateScreenStatusValidation,
  screenManagementController.updateScreenStatus
);

// Delete screen (admin)
router.delete(
  "/screen/delete/:id",
  auth,
  adminMiddleware,
  screenIdValidation,
  screenManagementController.deleteScreen
);

module.exports = router;


