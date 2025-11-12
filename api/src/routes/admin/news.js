const express = require('express');
const router = express.Router();
const newsController = require('../../controllers/newsController');
const upload = require('../../middleware/upload');
const cloudinary = require('../../config/cloudinary');
const { Readable } = require('stream');
const { auth, adminMiddleware } = require('../../middleware/auth');
const { newsQueryValidation, createNewsValidation, updateNewsValidation } = require('../../dto/request/newsDto');

/**
 * @swagger
 * tags:
 *   name: AdminNews
 *   description: Quản lý tin tức (Admin)
 */

// Middleware: upload image file to Cloudinary if present, then set req.body.image to URL
async function uploadImageToCloudinary(req, res, next) {
  try {
    if (!req.file) return next();
    // Convert buffer to readable stream without external deps
    const bufferToStream = (buffer) => {
      const readable = new Readable();
      readable._read = () => {};
      readable.push(buffer);
      readable.push(null);
      return readable;
    };
    const secureUrl = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream({ folder: 'news' }, (err, result) => {
        if (err) return reject(err);
        resolve(result.secure_url);
      });
      bufferToStream(req.file.buffer).pipe(uploadStream);
    });
    req.body.image = secureUrl;
    return next();
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Image upload failed', error: err.message });
  }
}

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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [title, content, author]
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               author:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Ảnh tin tức (file upload)
 *               is_published:
 *                 type: boolean
 *               published_at:
 *                 type: string
 *                 format: date-time
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
 *           pattern: ^[a-fA-F0-9]{24}$
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [title, content, author]
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               author:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Ảnh tin tức (file upload)
 *               is_published:
 *                 type: boolean
 *               published_at:
 *                 type: string
 *                 format: date-time
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
 *           pattern: ^[a-fA-F0-9]{24}$
 *     responses:
 *       200:
 *         description: Xóa tin tức thành công
 *       404:
 *         description: Không tìm thấy tin tức
 */

// Get all news (list)
router.get('/news', auth, adminMiddleware, newsQueryValidation, newsController.list);

// Create a news item
router.post(
  '/news/create',
  auth,
  adminMiddleware,
  upload.single('image'),
  uploadImageToCloudinary,
  createNewsValidation,
  newsController.create
);

// Update a news item
router.put(
  '/news/update/:id',
  auth,
  adminMiddleware,
  upload.single('image'),
  uploadImageToCloudinary,
  updateNewsValidation,
  newsController.update
);

// Delete a news item
router.delete('/news/delete/:id', auth, adminMiddleware, newsController.remove);

module.exports = router;
