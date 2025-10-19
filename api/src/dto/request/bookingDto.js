// DTOs for booking requests
const { body, param, query } = require("express-validator");

// Update booking status validation
const updateBookingStatusValidation = [
  param("id")
    .isMongoId()
    .withMessage("Booking ID must be a valid MongoDB ObjectId"),
  body("status")
    .isIn(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"])
    .withMessage(
      "Status must be one of: PENDING, CONFIRMED, CANCELLED, COMPLETED"
    ),
];

// Get bookings validation
const getBookingsValidation = [
  query("page")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Page must be a non-negative integer"),
  query("size")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Size must be between 1 and 100"),
  query("search")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Search term must not exceed 100 characters"),
  query("sortBy")
    .optional()
    .isIn([
      "created_at",
      "updated_at",
      "total_price_movie",
      "status",
      "booking_code",
    ])
    .withMessage(
      "Sort field must be one of: created_at, updated_at, total_price_movie, status, booking_code"
    ),
  query("direction")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("Direction must be asc or desc"),
];

// Get booking by ID validation
const getBookingByIdValidation = [
  param("id")
    .isMongoId()
    .withMessage("Booking ID must be a valid MongoDB ObjectId"),
];

module.exports = {
  updateBookingStatusValidation,
  getBookingsValidation,
  getBookingByIdValidation,
};
