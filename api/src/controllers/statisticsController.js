const statisticsService = require("../services/statisticsService");

class StatisticsController {
  // Helper method to handle common response pattern
  async handleStatisticsRequest(serviceMethod, res) {
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

  async getUserStatistics(req, res) {
    await this.handleStatisticsRequest(
      () => statisticsService.getUserStatistics(),
      res
    );
  }

  async getTicketStatistics(req, res) {
    await this.handleStatisticsRequest(
      () => statisticsService.getTicketStatistics(),
      res
    );
  }

  async getSupplierRevenueStatistics(req, res) {
    await this.handleStatisticsRequest(
      () => statisticsService.getSupplierRevenueStatistics(),
      res
    );
  }

  async getRevenueStatistics(req, res) {
    await this.handleStatisticsRequest(
      () => statisticsService.getRevenueStatistics(),
      res
    );
  }

  async getNewsEventStatistics(req, res) {
    await this.handleStatisticsRequest(
      () => statisticsService.getNewsEventStatistics(),
      res
    );
  }

  async getMovieStatistics(req, res) {
    await this.handleStatisticsRequest(
      () => statisticsService.getMovieStatistics(),
      res
    );
  }
}

module.exports = new StatisticsController();