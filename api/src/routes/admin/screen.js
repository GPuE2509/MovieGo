const express = require("express");
const router = express.Router();
const screenManagementController = require("../../controllers/screenManagementController");
const { auth, adminMiddleware } = require("../../middleware/auth");
const {
  screenQueryValidation,
  createScreenValidation,
  updateScreenValidation,
  screenIdValidation,
} = require("../../dto/request/screenDto");

// Get all screens (admin) - with pagination and search
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

// Get screens by Theater ID (admin)
router.get(
  "/screens/by-theater/:id",
  auth,
  adminMiddleware,
  screenIdValidation, // Re-using screenIdValidation as it checks for a valid MongoID in params
  screenManagementController.getScreenByTheaterId
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

// Delete screen (admin)
router.delete(
  "/screen/delete/:id",
  auth,
  adminMiddleware,
  screenIdValidation,
  screenManagementController.deleteScreen
);

// Suggest max columns
router.get(
  "/screens/suggest-columns",
  auth,
  adminMiddleware,
  screenManagementController.suggestColumns
);

// Suggest max rows
router.get(
  "/screens/suggest-rows",
  auth,
  adminMiddleware,
  screenManagementController.suggestRows
);

module.exports = router;


