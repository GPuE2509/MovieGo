const express = require('express');
const router = express.Router();
const movieSelectionController = require('../controllers/movieSelectionController');

/**
 * @swagger
 * tags:
 *   name: MovieSelectionPublic
 *   description: Xem danh sách phim có suất chiếu
 */

/**
 * @swagger
 * /api/v1/movies:
 *   get:
 *     summary: Lấy danh sách phim có suất chiếu
 *     tags: [MovieSelectionPublic]
 *     responses:
 *       200:
 *         description: Danh sách phim
 */

/**
 * @swagger
 * /api/v1/movies/{id}:
 *   get:
 *     summary: Lấy thông tin phim theo ID
 *     tags: [MovieSelectionPublic]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thông tin phim
 *       404:
 *         description: Không tìm thấy phim
 */

// Public: list movies that have active showtimes
router.get('/movies', movieSelectionController.getMovies);

// Public: get movie details by id
router.get('/movies/:id', movieSelectionController.getMovieById);

module.exports = router;
