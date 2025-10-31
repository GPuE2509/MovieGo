const bookingService = require('../services/bookingService');

class BookingUserController {
  async createBooking(req, res) {
    try {
      const userId = req.user?.id;
      const data = await bookingService.createBooking(userId, req.body, req);
      return res.status(201).json({ success: true, data });
    } catch (e) {
      return res.status(400).json({ success: false, message: `Booking creation failed: ${e.message}` });
    }
  }

  async applyCoupon(req, res) {
    try {
      const userId = req.user?.id;
      const { bookingId } = req.params;
      const { couponCode } = req.body;
      const data = await bookingService.applyCouponToBooking(userId, bookingId, couponCode);
      return res.status(200).json({ success: true, data });
    } catch (e) {
      return res.status(400).json({ success: false, message: `Failed to apply coupon: ${e.message}` });
    }
  }

  async getAllHistoryAward(req, res) {
    try {
      const userId = req.user?.id;
      const data = await bookingService.getAllHistoryAwards(userId);
      return res.status(200).json({ success: true, data });
    } catch (e) {
      return res.status(400).json({ success: false, message: `Failed to retrieve booking: ${e.message}` });
    }
  }

  async getBookingById(req, res) {
    try {
      const userId = req.user?.id;
      const { id } = req.params;
      const data = await bookingService.getBookingByIdUser(id, userId);
      return res.status(200).json({ success: true, data });
    } catch (e) {
      const code = /Unauthorized/.test(e.message) ? 403 : 400;
      return res.status(code).json({ success: false, message: e.message });
    }
  }

  async getMyBookings(req, res) {
    try {
      const userId = req.user?.id;
      const data = await bookingService.getBookingsByUserId(userId);
      return res.status(200).json({ success: true, data });
    } catch (e) {
      return res.status(400).json({ success: false, message: `Failed to retrieve bookings: ${e.message}` });
    }
  }

  async reserveSeats(req, res) {
    try {
      const { showtimeId } = req.params;
      const { seatIds } = req.body;
      const data = await bookingService.reserveSeats(showtimeId, seatIds, req);
      return res.status(200).json({ success: true, data });
    } catch (e) {
      return res.status(400).json({ success: false, message: `Seat reservation failed: ${e.message}` });
    }
  }

  async createPayment(req, res) {
    try {
      const userId = req.user?.id;
      const { bookingId } = req.params;
      const { paymentMethodId } = req.body;
      const data = await bookingService.createPayment(bookingId, userId, paymentMethodId, req);
      return res.status(201).json({ success: true, data });
    } catch (e) {
      return res.status(400).json({ success: false, message: `Payment creation failed: ${e.message}` });
    }
  }
}

module.exports = new BookingUserController();


