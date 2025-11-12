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
 *   description: Quản lý booking cho Admin - Hệ thống đặt vé xem phim MovieGo
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Booking:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID của booking
 *         user_id:
 *           type: string
 *           description: ID của người dùng
 *         showtime_id:
 *           type: string
 *           description: ID của suất chiếu
 *         total_seat:
 *           type: number
 *           minimum: 0
 *           description: Tổng số ghế đã đặt
 *         status:
 *           type: string
 *           enum: [PENDING, CANCELLED, COMPLETED]
 *           description: Trạng thái booking
 *         total_price_movie:
 *           type: number
 *           minimum: 0
 *           description: Tổng giá tiền phim
 *         booking_seats:
 *           type: array
 *           items:
 *             type: string
 *           description: Danh sách ID ghế đã đặt
 *         payment_id:
 *           type: string
 *           description: ID thanh toán
 *         notes:
 *           type: string
 *           maxLength: 500
 *           description: Ghi chú booking
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Thời gian tạo
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Thời gian cập nhật
 *     BookingResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: SUCCESS
 *         code:
 *           type: number
 *           example: 200
 *         data:
 *           type: object
 *         message:
 *           type: string
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: ERROR
 *         code:
 *           type: number
 *           example: 400
 *         data:
 *           type: array
 *         message:
 *           type: string
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /api/v1/admin/bookings:
 *   get:
 *     summary: Lấy danh sách tất cả booking
 *     description: Lấy danh sách booking với phân trang, tìm kiếm và sắp xếp. Chỉ dành cho Admin.
 *     tags: [AdminBooking]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Từ khóa tìm kiếm (tên user, email, ID booking)
 *         example: "john@example.com"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Số trang (bắt đầu từ 0)
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Số lượng booking trên mỗi trang
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [created_at, updated_at, status, total_price_movie]
 *           default: created_at
 *         description: Trường để sắp xếp
 *       - in: query
 *         name: direction
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Hướng sắp xếp
 *     responses:
 *       200:
 *         description: Lấy danh sách booking thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BookingResponse'
 *       400:
 *         description: Lỗi validation hoặc tham số không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Không có quyền truy cập (chưa đăng nhập)
 *       403:
 *         description: Không có quyền Admin
 */

/**
 * @swagger
 * /api/v1/admin/bookings/{id}:
 *   get:
 *     summary: Lấy thông tin chi tiết booking theo ID
 *     description: Lấy thông tin đầy đủ của một booking bao gồm thông tin user, showtime, ghế và thanh toán
 *     tags: [AdminBooking]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: MongoDB ObjectId của booking
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Lấy thông tin booking thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BookingResponse'
 *       400:
 *         description: ID không hợp lệ hoặc lỗi khác
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Không có quyền truy cập (chưa đăng nhập)
 *       403:
 *         description: Không có quyền Admin
 *       404:
 *         description: Không tìm thấy booking
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/v1/admin/bookings/status/{id}:
 *   put:
 *     summary: Cập nhật trạng thái booking
 *     description: |
 *       Cập nhật trạng thái booking. Các trạng thái hợp lệ: PENDING, COMPLETED, CANCELLED.
 *       Quy tắc chuyển đổi: PENDING → COMPLETED/CANCELLED, COMPLETED → CANCELLED, CANCELLED → không thể chuyển
 *     tags: [AdminBooking]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: MongoDB ObjectId của booking
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, COMPLETED, CANCELLED]
 *                 description: Trạng thái mới của booking
 *           example:
 *             status: "COMPLETED"
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái booking thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BookingResponse'
 *       400:
 *         description: Trạng thái không hợp lệ hoặc không thể chuyển đổi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Không có quyền truy cập (chưa đăng nhập)
 *       403:
 *         description: Không có quyền Admin
 *       404:
 *         description: Không tìm thấy booking
 */

/**
 * @swagger
 * /api/v1/admin/bookings/statistics:
 *   get:
 *     summary: Lấy thống kê booking
 *     description: Lấy các thống kê tổng quan về booking như tổng số booking, doanh thu, phân bố theo trạng thái
 *     tags: [AdminBooking]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy thống kê booking thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BookingResponse'
 *             example:
 *               status: SUCCESS
 *               code: 200
 *               data:
 *                 totalBookings: 1250
 *                 completedBookings: 980
 *                 pendingBookings: 120
 *                 cancelledBookings: 150
 *                 totalRevenue: 245000000
 *               message: "Booking statistics retrieved successfully"
 *       400:
 *         description: Lỗi khi lấy thống kê
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Không có quyền truy cập (chưa đăng nhập)
 *       403:
 *         description: Không có quyền Admin
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
