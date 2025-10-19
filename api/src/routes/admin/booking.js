const express = require("express");
const router = express.Router();
const bookingController = require("../../controllers/bookingController");
const { auth, adminMiddleware } = require("../../middleware");
const {
  updateBookingStatusValidation,
  getBookingsValidation,
  getBookingByIdValidation,
} = require("../../dto/request/bookingDto");
const { validationResult } = require("express-validator");

// Middleware to check for validation errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "ERROR",
      code: 400,
      data: errors.array(),
      message: "Validation failed",
    });
  }
  next();
};

// Admin Booking Management Routes (require admin role)
router.get(
  "/bookings",
  auth,
  adminMiddleware,
  getBookingsValidation,
  validate,
  bookingController.getAllBookings
);
router.get(
  "/bookings/:id",
  auth,
  adminMiddleware,
  getBookingByIdValidation,
  validate,
  bookingController.getBookingByIdAdmin
);
router.put(
  "/bookings/status/:id",
  auth,
  adminMiddleware,
  updateBookingStatusValidation,
  validate,
  bookingController.updateBookingStatus
);
router.get(
  "/bookings/statistics",
  auth,
  adminMiddleware,
  bookingController.getBookingStatistics
);

module.exports = router;
