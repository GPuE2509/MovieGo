const express = require('express');
const router = express.Router();
const theaterController = require('../../controllers/theaterController');
const { auth, adminMiddleware } = require('../../middleware/auth');
const { theaterQueryValidation, createTheaterValidation, updateTheaterValidation } = require('../../dto/request/theaterDto');

/**
 * @swagger
 * tags:
 *   name: AdminTheater
 *   description: Quản lý rạp chiếu phim (Admin)
 */

/**
 * @swagger
 * /api/v1/admin/theaters:
 *   get:
 *     summary: Lấy danh sách rạp
 *     tags: [AdminTheater]
 *     responses:
 *       200:
 *         description: Danh sách rạp
 */

/**
 * @swagger
 * /api/v1/admin/theater/{id}:
 *   get:
 *     summary: Lấy thông tin rạp theo ID
 *     tags: [AdminTheater]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thông tin rạp
 *       404:
 *         description: Không tìm thấy rạp
 */

/**
 * @swagger
 * /api/v1/admin/theater/create:
 *   post:
 *     summary: Tạo rạp mới
 *     tags: [AdminTheater]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, address, city]
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Tạo rạp thành công
 */

/**
 * @swagger
 * /api/v1/admin/theater/update/{id}:
 *   put:
 *     summary: Cập nhật thông tin rạp
 *     tags: [AdminTheater]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: ^[a-fA-F0-9]{24}$
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Cập nhật rạp thành công
 */

/**
 * @swagger
 * /api/v1/admin/theater/delete/{id}:
 *   delete:
 *     summary: Xóa rạp
 *     tags: [AdminTheater]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xóa rạp thành công
 *       404:
 *         description: Không tìm thấy rạp
 */

// Get all theaters (list)
router.get('/theaters', auth, adminMiddleware, theaterQueryValidation, theaterController.list);

// Get a theater by id
router.get('/theater/:id', auth, adminMiddleware, theaterController.getById);

// Create a theater
router.post('/theater/create', auth, adminMiddleware, createTheaterValidation, theaterController.create);

// Update a theater
router.put('/theater/update/:id', auth, adminMiddleware, updateTheaterValidation, theaterController.update);

// Delete a theater
router.delete('/theater/delete/:id', auth, adminMiddleware, theaterController.remove);

module.exports = router;
