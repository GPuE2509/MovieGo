const express = require('express');
const router = express.Router();
const genreController = require('../../controllers/genreController');
const { auth, adminMiddleware } = require('../../middleware/auth');
const { queryValidation, createGenreValidation, updateGenreValidation } = require('../../dto/request/genreDto');

/**
 * @swagger
 * tags:
 *   name: AdminGenre
 *   description: Quản lý thể loại phim (Admin)
 */

/**
 * @swagger
 * /api/v1/admin/genres:
 *   get:
 *     summary: Lấy danh sách thể loại phim
 *     tags: [AdminGenre]
 *     responses:
 *       200:
 *         description: Danh sách thể loại phim
 */

/**
 * @swagger
 * /api/v1/admin/genre/create:
 *   post:
 *     summary: Tạo thể loại phim mới
 *     tags: [AdminGenre]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               genre_name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tạo thể loại phim thành công
 */

/**
 * @swagger
 * /api/v1/admin/genre/update/{id}:
 *   put:
 *     summary: Cập nhật thể loại phim
 *     tags: [AdminGenre]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               genre_name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thể loại phim thành công
 */

/**
 * @swagger
 * /api/v1/admin/genre/delete/{id}:
 *   delete:
 *     summary: Xóa thể loại phim
 *     tags: [AdminGenre]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 
 *     responses:
 *       204:
 *         description: Xóa thể loại phim thành công (No Content)
 *       404:
 *         description: Không tìm thấy thể loại phim
 */

// List genres
router.get('/genres', auth, adminMiddleware, queryValidation, genreController.list);

// Create
router.post('/genre/create', auth, adminMiddleware, createGenreValidation, genreController.create);

// Update
router.put('/genre/update/:id', auth, adminMiddleware, updateGenreValidation, genreController.update);

// Delete
router.delete('/genre/delete/:id', auth, adminMiddleware, genreController.remove);

module.exports = router;
