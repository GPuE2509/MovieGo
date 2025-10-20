const userManagementService = require("../services/userManagementService");
const { validationResult } = require("express-validator");

class UserManagementController {
  async getAllUsers(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const {
        search = "",
        status = "",
        sortBy = "created_at",
        page = 0,
        size = 10,
      } = req.query;

      const pageNum = Number(page) || 0;
      const sizeNum = Math.min(Math.max(Number(size) || 10, 1), 100);

      const data = await userManagementService.getAllUsers(
        search,
        status,
        sortBy,
        pageNum,
        sizeNum
      );

      res.status(200).json({
        success: true,
        status: 200,
        code: 200,
        data: data,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await userManagementService.getUserById(id);

      const userResponse = {
        id: user._id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        avatar: user.avatar,
        phone: user.phone,
        address: user.address,
        status: user.status,
        points: user.point,
        banUntil: user.ban_until,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        roles: user.roles ? user.roles.map((role) => role.role_name) : [],
      };

      res.status(200).json({
        success: true,
        status: 200,
        code: 200,
        data: userResponse,
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

  async updateUserStatus(req, res) {
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
      const statusData = { ...req.body };

      const userResponse = await userManagementService.updateUserStatus(
        id,
        statusData
      );

      res.status(200).json({
        success: true,
        status: 200,
        code: 200,
        data: userResponse,
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
}

module.exports = new UserManagementController();
