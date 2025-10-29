const express = require('express');
const router = express.Router();
const showtimeController = require('../../controllers/showtimeController');
const { auth, adminMiddleware } = require('../../middleware/auth');

// POST /api/v1/admin/showtime/create
router.post('/showtime/create', auth, adminMiddleware, (req, res) => showtimeController.createShowtime(req, res));

// DELETE /api/v1/admin/showtime/delete/:id
router.delete('/showtime/delete/:id', auth, adminMiddleware, (req, res) => showtimeController.deleteShowtime(req, res));

// GET /api/v1/admin/showtimes/movie/:movieId
router.get('/showtimes/movie/:movieId', auth, adminMiddleware, (req, res) => showtimeController.getShowtimesAdminByMovieIdAndTheater(req, res));

module.exports = router;


