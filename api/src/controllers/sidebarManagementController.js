const sidebarManagementService = require("../services/sidebarManagement");

class SidebarManagementController {
  /**
   * Get promotions for carousel
   * GET /api/v1/promotions/carousel
   */
  async getPromotionsForCarousel(req, res) {
    try {
      const result = await sidebarManagementService.getPromotionsForCarousel();

      res.status(200).json({
        success: true,
        status: 200,
        code: 200,
        message: "Get promotions for carousel successfully",
        data: result.data,
        total: result.total
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get news for carousel
   * GET /api/v1/news/carousel
   */
  async getNewsForCarousel(req, res) {
    try {
      const result = await sidebarManagementService.getNewsForCarousel();

      res.status(200).json({
        success: true,
        status: 200,
        code: 200,
        message: "Get news for carousel successfully",
        data: result.data,
        total: result.total
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get top festivals
   * GET /api/v1/festivals/top
   */
  async getTopFestivals(req, res) {
    try {
      const result = await sidebarManagementService.getTopFestivals();

      res.status(200).json({
        success: true,
        status: 200,
        code: 200,
        message: "Get top festivals successfully",
        data: result.data,
        total: result.total
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new SidebarManagementController();
