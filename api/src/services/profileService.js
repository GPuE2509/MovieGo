const User = require("../models/user");
const bcrypt = require("bcryptjs");

class ProfileService {
  // Get user profile by ID
  async getUserProfile(id) {
    try {
      const user = await User.findById(id).populate("roles");
      if (!user) {
        throw new Error("User not found");
      }

      return {
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        avatar: user.avatar,
        phone: user.phone,
        address: user.address,
      };
    } catch (error) {
      throw new Error(`Failed to get user profile: ${error.message}`);
    }
  }

  // Update user profile
  async updateUserProfile(id, profileData) {
    try {
      const user = await User.findById(id);
      if (!user) {
        throw new Error("User not found");
      }

      // Validate required fields
      if (!profileData.firstName || profileData.firstName.trim() === "") {
        throw new Error("First name is required");
      }
      if (!profileData.lastName || profileData.lastName.trim() === "") {
        throw new Error("Last name is required");
      }
      if (!profileData.address || profileData.address.trim() === "") {
        throw new Error("Address is required");
      }

      // Validate phone number format if provided
      if (profileData.phone && profileData.phone.trim() !== "") {
        const phoneRegex = /^(03|05|07|08|09)[0-9]{8}$/;
        if (!phoneRegex.test(profileData.phone)) {
          throw new Error("Invalid phone number format");
        }
      }

      // Update user fields
      user.first_name = profileData.firstName.trim();
      user.last_name = profileData.lastName.trim();
      user.phone = profileData.phone ? profileData.phone.trim() : user.phone;
      user.address = profileData.address.trim();

      await user.save();

      return {
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        avatar: user.avatar,
        phone: user.phone,
        address: user.address,
      };
    } catch (error) {
      if (error.message === "User not found") {
        throw error;
      }
      throw new Error(`Failed to update user profile: ${error.message}`);
    }
  }

  // Update user avatar
  async updateUserAvatar(id, avatarUrl) {
    try {
      const user = await User.findById(id);
      if (!user) {
        throw new Error("User not found");
      }

      user.avatar = avatarUrl;
      await user.save();

      return {
        avatar: user.avatar,
      };
    } catch (error) {
      throw new Error(`Failed to update user avatar: ${error.message}`);
    }
  }

  // Change user password
  async changeUserPassword(id, passwordData) {
    try {
      const user = await User.findById(id);
      if (!user) {
        throw new Error("User not found");
      }

      // Verify old password
      const isOldPasswordValid = await user.comparePassword(
        passwordData.oldPassword
      );
      if (!isOldPasswordValid) {
        throw new Error("Old password is incorrect");
      }

      // Verify new password and confirm password match
      if (passwordData.newPassword !== passwordData.confirmNewPassword) {
        throw new Error("New password and confirm password do not match");
      }

      // Update password
      user.password = passwordData.newPassword;
      await user.save();

      return {
        message: "Password changed successfully",
      };
    } catch (error) {
      if (
        error.message === "User not found" ||
        error.message === "Old password is incorrect" ||
        error.message === "New password and confirm password do not match"
      ) {
        throw error;
      }
      throw new Error(`Failed to change password: ${error.message}`);
    }
  }
}

module.exports = new ProfileService();
