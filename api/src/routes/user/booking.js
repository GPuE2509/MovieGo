const express = require('express');
const router = express.Router();
const controller = require('../../controllers/bookingUserController');
const { auth } = require('../../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: UserBooking
 *   description: Quản lý đặt vé của người dùng
 */

/**
 * @swagger
 * /api/v1/user/bookings:
 *   post:
 *     summary: Tạo booking mới
 *     tags: [UserBooking]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               showtime_id:
 *                 type: string
 *               seatIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Đặt vé thành công
 */

/**
 * @swagger
 * /api/v1/user/bookings/apply-coupon/{bookingId}:
 *   post:
 *     summary: Áp dụng coupon cho booking
 *     tags: [UserBooking]
 *     parameters:
 *       - in: path
 *         name: bookingId
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
 *               couponCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Coupon đã được áp dụng
 */

/**
 * @swagger
 * /api/v1/user/bookings/getAllHistoryAward:
 *   get:
 *     summary: Lấy lịch sử nhận thưởng
 *     tags: [UserBooking]
 *     responses:
 *       200:
 *         description: Danh sách lịch sử nhận thưởng
 */

/**
 * @swagger
 * /api/v1/user/bookings/{id}:
 *   get:
 *     summary: Lấy thông tin booking theo ID
 *     tags: [UserBooking]
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
 * /api/v1/user/bookings/my-bookings/list:
 *   get:
 *     summary: Lấy danh sách booking của người dùng
 *     tags: [UserBooking]
 *     responses:
 *       200:
 *         description: Danh sách booking
 */

/**
 * @swagger
 * /api/v1/user/bookings/reserve/{showtimeId}:
 *   post:
 *     summary: Đặt chỗ trước cho suất chiếu
 *     tags: [UserBooking]
 *     parameters:
 *       - in: path
 *         name: showtimeId
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
 *               seatIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Đặt chỗ thành công
 */

/**
 * @swagger
 * /api/v1/user/bookings/pay/{bookingId}:
 *   post:
 *     summary: Thanh toán booking
 *     tags: [UserBooking]
 *     parameters:
 *       - in: path
 *         name: bookingId
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
 *               paymentMethodId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Thanh toán thành công
 */

// Base: /api/v1/user/bookings
router.post('/', auth, (req, res) => controller.createBooking(req, res));
router.post('/apply-coupon/:bookingId', auth, (req, res) => controller.applyCoupon(req, res));
router.get('/getAllHistoryAward', auth, (req, res) => controller.getAllHistoryAward(req, res));
router.get('/:id', auth, (req, res) => controller.getBookingById(req, res));
router.get('/my-bookings/list', auth, (req, res) => controller.getMyBookings(req, res));
router.post('/reserve/:showtimeId', auth, (req, res) => controller.reserveSeats(req, res));
router.post('/pay/:bookingId', auth, (req, res) => controller.createPayment(req, res));

module.exports = router;


