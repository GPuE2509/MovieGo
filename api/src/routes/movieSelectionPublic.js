const express = require('express');
const router = express.Router();
const movieSelectionController = require('../controllers/movieSelectionController');

// Public: list movies that have active showtimes
router.get('/movies', movieSelectionController.getMovies);

// Public: get movie details by id
router.get('/movies/:id', movieSelectionController.getMovieById);

module.exports = router;
