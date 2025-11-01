const express = require('express');
const router = express.Router();
const showtimeController = require('../../controllers/showtimeController');
const { auth, adminMiddleware } = require('../../middleware/auth');
const { createShowtimeValidation } = require('../../dto/request/showtimeDto');
const { validationResult } = require('express-validator');

// helper to handle validation errors in route
function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "BAD_REQUEST",
      code: 400,
      data: errors.array().map(e => ({ msg: e.msg, path: e.path, location: e.location }))
    });
  }
  next();
}

// POST /api/v1/admin/showtime/create
router.post('/showtime/create', auth, adminMiddleware, createShowtimeValidation, handleValidation, (req, res) => showtimeController.createShowtime(req, res));

// DELETE /api/v1/admin/showtime/delete/:id
router.delete('/showtime/delete/:id', auth, adminMiddleware, (req, res) => showtimeController.deleteShowtime(req, res));

// GET /api/v1/admin/showtimes/movie/:movieId
router.get('/showtimes/movie/:movieId', auth, adminMiddleware, (req, res) => showtimeController.getShowtimesAdminByMovieIdAndTheater(req, res));

module.exports = router;


