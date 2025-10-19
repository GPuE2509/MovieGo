// controllers/bookingController.js
const bookingService = require("../services/bookingService");

class BookingController {
  // Get all bookings with pagination and search (Admin)
  async getAllBookings(req, res) {
    try {
      const {
        search = "",
        page = 0,
        size = 10,
        sortBy = "created_at",
        direction = "desc",
      } = req.query;

      const result = await bookingService.getAllBookings(
        search,
        parseInt(page),
        parseInt(size),
        sortBy,
        direction
      );

      res.status(200).json({
        status: "SUCCESS",
        code: 200,
        data: result,
        message: "Bookings retrieved successfully",
      });
    } catch (error) {
      res.status(400).json({
        status: "ERROR",
        code: 400,
        data: null,
        message: error.message,
      });
    }
  }

  // Get booking by ID (Admin)
  async getBookingByIdAdmin(req, res) {
    try {
      const { id } = req.params;

      const result = await bookingService.getBookingByIdAdmin(id);

      res.status(200).json({
        status: "SUCCESS",
        code: 200,
        data: result,
        message: "Booking details retrieved successfully",
      });
    } catch (error) {
      res.status(400).json({
        status: "ERROR",
        code: 400,
        data: null,
        message: error.message,
      });
    }
  }

  // Update booking status (Admin)
  async updateBookingStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const result = await bookingService.updateBookingStatus(id, status);

      res.status(200).json({
        status: "SUCCESS",
        code: 200,
        data: result,
        message: "Booking status updated successfully",
      });
    } catch (error) {
      res.status(400).json({
        status: "ERROR",
        code: 400,
        data: null,
        message: error.message,
      });
    }
  }

  // Get booking statistics (Admin)
  async getBookingStatistics(req, res) {
    try {
      const result = await bookingService.getBookingStatistics();

      res.status(200).json({
        status: "SUCCESS",
        code: 200,
        data: result,
        message: "Booking statistics retrieved successfully",
      });
    } catch (error) {
      res.status(400).json({
        status: "ERROR",
        code: 400,
        data: null,
        message: error.message,
      });
    }
  }
}

module.exports = new BookingController();
