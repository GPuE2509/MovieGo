const statisticsService = require("../services/statisticsService");

class StatisticsController {
  async getUserStatistics(req, res) {
    try {
      const data = await statisticsService.getUserStatistics();
      if (!data) {
        return res.status(500).json({
          status: 500,
          code: 500,
          data: "Failed to retrieve user statistics: Data is null"
        });
      }
      return res.status(200).json({
        status: 200,
        code: 200,
        data: Object.keys(data).length === 0 ? {} : data
      });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        code: 500,
        data: "An unexpected error occurred: " + error.message
      });
    }
  }

  async getMovieStatistics(req, res) {
    try {
      const data = await statisticsService.getMovieStatistics();
      if (!data) {
        return res.status(500).json({
          status: 500,
          code: 500,
          data: "Failed to retrieve movie statistics: Data is null"
        });
      }
      return res.status(200).json({
        status: 200,
        code: 200,
        data: Object.keys(data).length === 0 ? {} : data
      });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        code: 500,
        data: "An unexpected error occurred: " + error.message
      });
    }
  }

  async getRevenueStatistics(req, res) {
    try {
      const { startDate, endDate } = req.query;

      // Validate required parameters
      if (!startDate || !endDate) {
        return res.status(400).json({
          status: 400,
          code: 400,
          data: "Invalid date range: Both startDate and endDate are required"
        });
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      // Validate date range
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({
          status: 400,
          code: 400,
          data: "Invalid date range: Invalid date format"
        });
      }

      if (start > end) {
        return res.status(400).json({
          status: 400,
          code: 400,
          data: "Invalid date range: startDate must be before endDate"
        });
      }

      const data = await statisticsService.getRevenueStatistics(start, end);
      if (!data) {
        return res.status(500).json({
          status: 500,
          code: 500,
          data: "Failed to retrieve revenue statistics: Data is null"
        });
      }
      return res.status(200).json({
        status: 200,
        code: 200,
        data: Object.keys(data).length === 0 ? {} : data
      });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        code: 500,
        data: "An unexpected error occurred: " + error.message
      });
    }
  }

  async getTicketStatistics(req, res) {
    try {
      const { startDate, endDate } = req.query;

      // Validate required parameters
      if (!startDate || !endDate) {
        return res.status(400).json({
          status: 400,
          code: 400,
          data: "Invalid date range: Both startDate and endDate are required"
        });
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      // Validate date range
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({
          status: 400,
          code: 400,
          data: "Invalid date range: Invalid date format"
        });
      }

      if (start > end) {
        return res.status(400).json({
          status: 400,
          code: 400,
          data: "Invalid date range: startDate must be before endDate"
        });
      }

      const data = await statisticsService.getTicketStatistics(start, end);
      if (!data) {
        return res.status(500).json({
          status: 500,
          code: 500,
          data: "Failed to retrieve ticket statistics: Data is null"
        });
      }
      return res.status(200).json({
        status: 200,
        code: 200,
        data: data
      });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        code: 500,
        data: "An unexpected error occurred: " + error.message
      });
    }
  }

  async getNewsEventStatistics(req, res) {
    try {
      const data = await statisticsService.getNewsEventStatistics();
      if (!data) {
        return res.status(500).json({
          status: 500,
          code: 500,
          data: "Failed to retrieve news and event statistics: Data is null"
        });
      }
      return res.status(200).json({
        status: 200,
        code: 200,
        data: data
      });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        code: 500,
        data: "An unexpected error occurred: " + error.message
      });
    }
  }

  async getSupplierRevenueStatistics(req, res) {
    try {
      const { startDate, endDate } = req.query;

      // Validate required parameters
      if (!startDate || !endDate) {
        return res.status(400).json({
          status: 400,
          code: 400,
          data: "Invalid date range: Both startDate and endDate are required"
        });
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      // Validate date range
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({
          status: 400,
          code: 400,
          data: "Invalid date range: Invalid date format"
        });
      }

      if (start > end) {
        return res.status(400).json({
          status: 400,
          code: 400,
          data: "Invalid date range: startDate must be before endDate"
        });
      }

      const data = await statisticsService.getSupplierRevenueStatistics(start, end);
      if (!data) {
        return res.status(500).json({
          status: 500,
          code: 500,
          data: "Failed to retrieve supplier revenue statistics: Data is null"
        });
      }
      return res.status(200).json({
        status: 200,
        code: 200,
        data: data
      });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        code: 500,
        data: "An unexpected error occurred: " + error.message
      });
    }
  }
}

module.exports = new StatisticsController();