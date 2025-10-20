const express = require("express");
const router = express.Router();
const profileController = require("../../controllers/profileController");
const upload = require("../../middleware/upload");
const { auth, userMiddleware } = require("../../middleware/auth");
const {
  updateProfileValidation,
  updateAvatarValidation,
  changePasswordValidation,
  userIdValidation,
} = require("../../dto/request/profileDto");

// Get user profile
router.get(
  "/get-profile-user/:id",
  auth,
  userMiddleware,
  userIdValidation,
  profileController.getProfileUser
);

// Update user profile
router.put(
  "/update-profile-user/:id",
  auth,
  userMiddleware,
  upload.none(),
  updateProfileValidation,
  profileController.updateProfileUser
);

// Update user avatar
router.put(
  "/update-avatar-user/:id",
  auth,
  userMiddleware,
  upload.single("avatar"),
  updateAvatarValidation,
  profileController.updateAvatarUser
);

// Change user password
router.put(
  "/change-password/:id",
  auth,
  userMiddleware,
  changePasswordValidation,
  profileController.changePassword
);

module.exports = router;
