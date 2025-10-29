const screenManagementService = require("../services/screenManagementService");
const { validationResult } = require("express-validator");

class ScreenManagementController {
  async getAllScreens(req, res) {
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
        theaterId = "",
        sortBy = "created_at",
        page = 0,
        size = 10,
      } = req.query;

      const pageNum = Number(page) || 0;
      const sizeNum = Math.min(Math.max(Number(size) || 10, 1), 100);

      const data = await screenManagementService.getAllScreens(
        search,
        status,
        theaterId,
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

  async getScreenById(req, res) {
    try {
      const { id } = req.params;
      const screen = await screenManagementService.getScreenById(id);
      res.status(200).json({ success: true, status: 200, code: 200, data: screen });
    } catch (error) {
      if (error.message === "Screen not found") {
        return res.status(404).json({ success: false, message: "Screen not found" });
      }
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async createScreen(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }
      const payload = { ...req.body };
      const screen = await screenManagementService.createScreen(payload);
      res.status(201).json({
        success: true,
        status: 201,
        code: 201,
        data: screen,
        message: "Screen created successfully",
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async updateScreen(req, res) {
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
      const updateData = { ...req.body };
      const screen = await screenManagementService.updateScreen(id, updateData);
      res.status(200).json({
        success: true,
        status: 200,
        code: 200,
        data: screen,
        message: "Screen updated successfully",
      });
    } catch (error) {
      if (error.message === "Screen not found") {
        return res.status(404).json({ success: false, message: "Screen not found" });
      }
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async updateScreenStatus(req, res) {
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
      const { is_active } = req.body;
      const result = await screenManagementService.updateScreenStatus(id, is_active);
      res.status(200).json({ success: true, status: 200, code: 200, data: result });
    } catch (error) {
      if (error.message === "Screen not found") {
        return res.status(404).json({ success: false, message: "Screen not found" });
      }
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async deleteScreen(req, res) {
    try {
      const { id } = req.params;
      const result = await screenManagementService.deleteScreen(id);
      res.status(200).json({ success: true, status: 200, code: 200, data: result });
    } catch (error) {
      if (error.message === "Screen not found") {
        return res.status(404).json({ success: false, message: "Screen not found" });
      }
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = new ScreenManagementController();


