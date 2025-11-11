const express = require('express');
const router = express.Router();
const showtimeController = require('../controllers/showtimeController');
const seatSelectionController = require('../controllers/seatSelectionController');
const { auth, adminMiddleware } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: ShowtimePublic
 *   description: Xem thông tin suất chiếu công khai
 */

/**
 * @swagger
 * /api/v1/movie/{movieId}:
 *   get:
 *     summary: Lấy suất chiếu theo phim
 *     tags: [ShowtimePublic]
 *     parameters:
 *       - in: path
 *         name: movieId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Danh sách suất chiếu
 */

/**
 * @swagger
 * /api/v1/showtimes/movie/{movieId}:
 *   get:
 *     summary: Lấy suất chiếu theo phim và rạp
 *     tags: [ShowtimePublic]
 *     parameters:
 *       - in: path
 *         name: movieId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Danh sách suất chiếu
 */

/**
 * @swagger
 * /api/v1/showtimes/dates/{movieId}:
 *   get:
 *     summary: Lấy các ngày có suất chiếu theo phim và rạp
 *     tags: [ShowtimePublic]
 *     parameters:
 *       - in: path
 *         name: movieId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Danh sách ngày có suất chiếu
 */

/**
 * @swagger
 * /api/v1/showtime/{id}:
 *   get:
 *     summary: Lấy thông tin suất chiếu theo ID
 *     tags: [ShowtimePublic]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thông tin suất chiếu
 *       404:
 *         description: Không tìm thấy suất chiếu
 */

/**
 * @swagger
 * /api/v1/showtimes/{showtimeId}/seats:
 *   get:
 *     summary: Lấy danh sách ghế của suất chiếu
 *     tags: [ShowtimePublic]
 *     parameters:
 *       - in: path
 *         name: showtimeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Danh sách ghế
 */

/**
 * @swagger
 * /api/v1/seat/showtime/{showtimeId}:
 *   get:
 *     summary: Lấy trạng thái ghế theo suất chiếu
 *     tags: [ShowtimePublic]
 *     parameters:
 *       - in: path
 *         name: showtimeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Trạng thái ghế
 */

/**
 * @swagger
 * /api/v1/showtime/movie/{movieId}/theater/{theaterId}:
 *   get:
 *     summary: Lấy suất chiếu theo phim, rạp và ngày
 *     tags: [ShowtimePublic]
 *     parameters:
 *       - in: path
 *         name: movieId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: theaterId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *         description: Ngày suất chiếu
 *     responses:
 *       200:
 *         description: Danh sách suất chiếu
 */

// GET /api/v1/movie/:movieId
router.get('/movie/:movieId', (req, res) => showtimeController.getShowtimesByMovieId(req, res));

// GET /api/v1/showtimes/movie/:movieId
router.get('/showtimes/movie/:movieId', (req, res) => showtimeController.getShowtimesByMovieIdAndTheater(req, res));

// GET /api/v1/showtimes/dates/:movieId
router.get('/showtimes/dates/:movieId', (req, res) => showtimeController.getAvailableDatesByMovieIdAndTheater(req, res));

// GET /api/v1/showtime/:id (requires auth for parity with Java; allow user or admin)
router.get('/showtime/:id', auth, (req, res) => showtimeController.getShowtimeById(req, res));

// GET /api/v1/showtimes/:showtimeId/seats
router.get('/showtimes/:showtimeId/seats', (req, res) => showtimeController.getSeatsByShowtimeId(req, res));

// GET /api/v1/seat/showtime/:showtimeId (grouped by row for selection)
router.get('/seat/showtime/:showtimeId', (req, res) => seatSelectionController.getSeatStatus(req, res));

// GET /api/v1/showtime/movie/:movieId/theater/:theaterId?date=YYYY-MM-DD
router.get('/showtime/movie/:movieId/theater/:theaterId', (req, res) => showtimeController.getShowtimesByMovieAndTheater(req, res));

module.exports = router;


