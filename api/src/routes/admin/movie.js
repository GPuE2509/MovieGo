const express = require('express');
const router = express.Router();
const movieController = require('../../controllers/movieController');
const upload = require('../../middleware/upload');
const { auth, adminMiddleware } = require('../../middleware/auth');
const {
  movieQueryValidation,
  createMovieValidation,
  updateMovieValidation
} = require('../../dto/request/movieDto');

/**
 * @swagger
 * tags:
 *   name: AdminMovie
 *   description: Quản lý phim (Admin)
 */

/**
 * @swagger
 * /api/v1/admin/movies:
 *   get:
 *     summary: Lấy danh sách phim
 *     tags: [AdminMovie]
 *     responses:
 *       200:
 *         description: Danh sách phim
 */

/**
 * @swagger
 * /api/v1/admin/movie/{id}:
 *   get:
 *     summary: Lấy thông tin phim theo ID
 *     tags: [AdminMovie]
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

/**
 * @swagger
 * /api/v1/admin/movie/create:
 *   post:
 *     summary: Tạo phim mới
 *     tags: [AdminMovie]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Tạo phim thành công
 */

/**
 * @swagger
 * /api/v1/admin/movie/update/{id}:
 *   put:
 *     summary: Cập nhật thông tin phim
 *     tags: [AdminMovie]
 *     parameters:
 *       - in: path
 *         name: id
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
 *               title:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật phim thành công
 */

/**
 * @swagger
 * /api/v1/admin/movie/update/image/{id}:
 *   patch:
 *     summary: Cập nhật ảnh phim
 *     tags: [AdminMovie]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Cập nhật ảnh phim thành công
 */

/**
 * @swagger
 * /api/v1/admin/movie/delete/{id}:
 *   delete:
 *     summary: Xóa phim
 *     tags: [AdminMovie]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xóa phim thành công
 *       404:
 *         description: Không tìm thấy phim
 */

/**
 * @swagger
 * /api/v1/admin/genres:
 *   get:
 *     summary: Lấy danh sách thể loại phim cho admin
 *     tags: [AdminMovie]
 *     responses:
 *       200:
 *         description: Danh sách thể loại phim
 */

// List movies (admin)
router.get('/movies', auth, adminMiddleware, movieQueryValidation, movieController.getAllMovies);

// Get by id (admin)
router.get('/movie/:id', auth, adminMiddleware, movieController.getMovieById);

// Create (admin) - multipart/form-data
router.post('/movie/create', auth, adminMiddleware, upload.single('image'), createMovieValidation, movieController.createMovie);

// Update details (admin)
router.put('/movie/update/:id', auth, adminMiddleware, updateMovieValidation, movieController.updateMovie);

// Update image (admin) - multipart/form-data
router.patch('/movie/update/image/:id', auth, adminMiddleware, upload.single('image'), movieController.updateMovieImage);

// Delete (admin)
router.delete('/movie/delete/:id', auth, adminMiddleware, movieController.deleteMovie);

// Extra: genres list for admin forms
router.get('/genres', auth, adminMiddleware, async (req, res) => {
  try {
    const movieService = require('../../services/movieService');
    const genres = await movieService.getAllGenres();
    res.status(200).json({ success: true, data: genres });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
