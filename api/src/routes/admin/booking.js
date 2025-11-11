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

/**
 * @swagger
 * tags:
 *   name: AdminBooking
 *   description: Quản lý booking (Admin)
 */

/**
 * @swagger
 * /api/v1/admin/bookings:
 *   get:
 *     summary: Lấy danh sách booking
 *     tags: [AdminBooking]
 *     responses:
 *       200:
 *         description: Danh sách booking
 */

/**
 * @swagger
 * /api/v1/admin/bookings/{id}:
 *   get:
 *     summary: Lấy thông tin booking theo ID
 *     tags: [AdminBooking]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thông tin booking
 *       404:
 *         description: Không tìm thấy booking
 */

/**
 * @swagger
 * /api/v1/admin/bookings/status/{id}:
 *   put:
 *     summary: Cập nhật trạng thái booking
 *     tags: [AdminBooking]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái booking thành công
 */

/**
 * @swagger
 * /api/v1/admin/bookings/statistics:
 *   get:
 *     summary: Lấy thống kê booking
 *     tags: [AdminBooking]
 *     responses:
 *       200:
 *         description: Thống kê booking
 */

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
