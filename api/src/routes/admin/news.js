const express = require('express');
const router = express.Router();
const newsController = require('../../controllers/newsController');
const { auth, adminMiddleware } = require('../../middleware/auth');
const { newsQueryValidation, createNewsValidation, updateNewsValidation } = require('../../dto/request/newsDto');

/**
 * @swagger
 * tags:
 *   name: AdminNews
 *   description: Quản lý tin tức (Admin)
 */

/**
 * @swagger
 * /api/v1/admin/news:
 *   get:
 *     summary: Lấy danh sách tin tức
 *     tags: [AdminNews]
 *     responses:
 *       200:
 *         description: Danh sách tin tức
 */

/**
 * @swagger
 * /api/v1/admin/news/create:
 *   post:
 *     summary: Tạo tin tức mới
 *     tags: [AdminNews]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tạo tin tức thành công
 */

/**
 * @swagger
 * /api/v1/admin/news/update/{id}:
 *   put:
 *     summary: Cập nhật tin tức
 *     tags: [AdminNews]
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
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật tin tức thành công
 */

/**
 * @swagger
 * /api/v1/admin/news/delete/{id}:
 *   delete:
 *     summary: Xóa tin tức
 *     tags: [AdminNews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xóa tin tức thành công
 *       404:
 *         description: Không tìm thấy tin tức
 */

// Get all news (list)
router.get('/news', auth, adminMiddleware, newsQueryValidation, newsController.list);

// Create a news item
router.post('/news/create', auth, adminMiddleware, createNewsValidation, newsController.create);

// Update a news item
router.put('/news/update/:id', auth, adminMiddleware, updateNewsValidation, newsController.update);

// Delete a news item
router.delete('/news/delete/:id', auth, adminMiddleware, newsController.remove);

module.exports = router;
