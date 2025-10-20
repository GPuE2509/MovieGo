const express = require("express");
const router = express.Router();
const userManagementController = require("../../controllers/userManagementController");
const { auth, adminMiddleware } = require("../../middleware/auth");
const {
  userQueryValidation,
  updateUserStatusValidation,
  userIdValidation,
} = require("../../dto/request/userDto");

// Get all users (admin) - with pagination, search and filters
router.get(
  "/",
  auth,
  adminMiddleware,
  userQueryValidation,
  userManagementController.getAllUsers
);

// Get user by ID (admin)
router.get(
  "/:id",
  auth,
  adminMiddleware,
  userIdValidation,
  userManagementController.getUserById
);

// Update user status (admin)
router.patch(
  "/update/status/:id",
  auth,
  adminMiddleware,
  updateUserStatusValidation,
  userManagementController.updateUserStatus
);

module.exports = router;
