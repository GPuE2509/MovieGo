const promotionManagementService = require("../services/promotionManagement");
const { validationResult } = require("express-validator");

class PromotionManagementController {
  async getAllPromotions(req, res) {
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

      const data = await promotionManagementService.getAllPromotions(
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

  async getPromotionById(req, res) {
    try {
      const { id } = req.params;
      const promotion = await promotionManagementService.getPromotionById(id);

      res.status(200).json({
        success: true,
        status: 200,
        code: 200,
        data: promotion,
      });
    } catch (error) {
      if (error.message === "Promotion not found") {
        return res.status(404).json({
          success: false,
          message: "Promotion not found",
        });
      }
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async createPromotion(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const promotionData = { ...req.body };
      const promotion = await promotionManagementService.createPromotion(promotionData);

      res.status(201).json({
        success: true,
        status: 201,
        code: 201,
        data: promotion,
        message: "Promotion created successfully",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async updatePromotion(req, res) {
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

      const promotion = await promotionManagementService.updatePromotion(id, updateData);

      res.status(200).json({
        success: true,
        status: 200,
        code: 200,
        data: promotion,
        message: "Promotion updated successfully",
      });
    } catch (error) {
      if (error.message === "Promotion not found") {
        return res.status(404).json({
          success: false,
          message: "Promotion not found",
        });
      }
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }


  async deletePromotion(req, res) {
    try {
      const { id } = req.params;
      const result = await promotionManagementService.deletePromotion(id);

      res.status(200).json({
        success: true,
        status: 200,
        code: 200,
        data: result,
      });
    } catch (error) {
      if (error.message === "Promotion not found") {
        return res.status(404).json({
          success: false,
          message: "Promotion not found",
        });
      }
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

}

module.exports = new PromotionManagementController();
