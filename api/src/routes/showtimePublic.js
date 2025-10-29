const express = require('express');
const router = express.Router();
const showtimeController = require('../controllers/showtimeController');
const { auth, adminMiddleware } = require('../middleware/auth');

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

// GET /api/v1/showtime/movie/:movieId/theater/:theaterId?date=YYYY-MM-DD
router.get('/showtime/movie/:movieId/theater/:theaterId', (req, res) => showtimeController.getShowtimesByMovieAndTheater(req, res));

module.exports = router;


