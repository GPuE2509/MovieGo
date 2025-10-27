const bannerService = require("../services/bannerService");
const { validationResult } = require("express-validator");

class BannerController {
  // Helper method to handle common response pattern
  async handleBannerRequest(serviceMethod, res) {
    try {
      const data = await serviceMethod();
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

  // Helper method to handle validation errors
  handleValidationErrors(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }
    return null;
  }

  // GET /api/v1/admin/banners - Get all banners
  async getAllBanners(req, res) {
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
        is_active = "",
        sortBy = "created_at",
        page = 0,
        size = 10,
      } = req.query;

      const pageNum = Number(page) || 0;
      const sizeNum = Math.min(Math.max(Number(size) || 10, 1), 100);

      const data = await bannerService.getAllBanners(
        search,
        is_active,
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

  // GET /api/v1/admin/banners/:id - Get banner by ID
  async getBannerById(req, res) {
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
      const banner = await bannerService.getBannerById(id);

      res.status(200).json({
        success: true,
        status: 200,
        code: 200,
        data: banner,
      });
    } catch (error) {
      if (error.message === "Banner not found") {
        return res.status(404).json({
          success: false,
          message: "Banner not found",
        });
      }
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // POST /api/v1/admin/banners - Create new banner
  async createBanner(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const bannerData = { ...req.body };
      const banner = await bannerService.createBanner(bannerData);

      res.status(201).json({
        success: true,
        status: 201,
        code: 201,
        data: banner,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // PUT /api/v1/admin/banners/:id - Update banner
  async updateBanner(req, res) {
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
      const banner = await bannerService.updateBanner(id, updateData);

      res.status(200).json({
        success: true,
        status: 200,
        code: 200,
        data: banner,
      });
    } catch (error) {
      if (error.message === "Banner not found") {
        return res.status(404).json({
          success: false,
          message: "Banner not found",
        });
      }
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new BannerController();
