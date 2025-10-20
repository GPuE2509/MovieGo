const profileService = require("../services/profileService");
const cloudinary = require("../config/cloudinary");
const { validationResult } = require("express-validator");

class ProfileController {
  // Get user profile
  async getProfileUser(req, res) {
    try {
      const { id } = req.params;
      const profile = await profileService.getUserProfile(id);

      res.status(200).json({
        success: true,
        status: 200,
        code: 200,
        data: profile,
      });
    } catch (error) {
      if (error.message === "User not found") {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Update user profile
  async updateProfileUser(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { id } = req.params;
      const profileData = { ...req.body };

      const updatedProfile = await profileService.updateUserProfile(
        id,
        profileData
      );

      res.status(200).json({
        success: true,
        status: 200,
        code: 200,
        data: updatedProfile,
      });
    } catch (error) {
      if (error.message === "User not found") {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Update user avatar
  async updateAvatarUser(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Avatar file cannot be empty",
        });
      }

      const { id } = req.params;
      const buffer = req.file.buffer;

      const uploadStream = () =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { resource_type: "image", folder: `users/${id}` },
            (err, result) => {
              if (err) return reject(err);
              resolve(result);
            }
          );
          stream.end(buffer);
        });

      const result = await uploadStream();
      const avatarResponse = await profileService.updateUserAvatar(
        id,
        result.secure_url
      );

      res.status(200).json({
        success: true,
        status: 200,
        code: 200,
        data: avatarResponse,
      });
    } catch (error) {
      if (error.message === "User not found") {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
      res.status(400).json({
        success: false,
        message: `Failed to upload avatar: ${error.message}`,
      });
    }
  }

  // Change user password
  async changePassword(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { id } = req.params;
      const passwordData = { ...req.body };

      const result = await profileService.changeUserPassword(id, passwordData);

      res.status(200).json({
        success: true,
        status: 200,
        code: 200,
        data: result.message,
      });
    } catch (error) {
      if (error.message === "User not found") {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
      if (error.message === "Old password is incorrect") {
        return res.status(401).json({
          success: false,
          message: "Old password is incorrect",
        });
      }
      if (error.message === "New password and confirm password do not match") {
        return res.status(400).json({
          success: false,
          message: "New password and confirm password do not match",
        });
      }
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new ProfileController();
