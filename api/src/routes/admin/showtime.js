const express = require('express');
const router = express.Router();
const showtimeController = require('../../controllers/showtimeController');
const { auth, adminMiddleware } = require('../../middleware/auth');
const { createShowtimeValidation } = require('../../dto/request/showtimeDto');
const { validationResult } = require('express-validator');

/**
 * @swagger
 * tags:
 *   name: AdminShowtime
 *   description: Quản lý suất chiếu (Admin)
 */

/**
 * @swagger
 * /api/v1/admin/showtime/create:
 *   post:
 *     summary: Tạo suất chiếu mới
 *     tags: [AdminShowtime]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               movieId:
 *                 type: string
 *               theaterId:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               time:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tạo suất chiếu thành công
 */

/**
 * @swagger
 * /api/v1/admin/showtime/delete/{id}:
 *   delete:
 *     summary: Xóa suất chiếu
 *     tags: [AdminShowtime]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xóa suất chiếu thành công
 *       404:
 *         description: Không tìm thấy suất chiếu
 */

/**
 * @swagger
 * /api/v1/admin/showtimes/movie/{movieId}:
 *   get:
 *     summary: Lấy danh sách suất chiếu theo phim
 *     tags: [AdminShowtime]
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


