import express from 'express';
import multer from 'multer';
import adminNewsController from '../../controllers/admin/newsController.js';
import { validateNews, validatePagination } from '../../validators/newsValidator.js';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

/**
 * @swagger
 * /api/v1/admin/news:
 *   get:
 *     summary: Get all news (Admin)
 *     description: Retrieve a paginated list of news with optional search
 *     tags: [Admin News]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Page number (0-based)
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: sortField
 *         schema:
 *           type: string
 *           default: title
 *           enum: [title, createdAt, updatedAt]
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           default: asc
 *           enum: [asc, desc]
 *         description: Sort order
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           default: ""
 *         description: Search term for title
 *     responses:
 *       200:
 *         description: Successful retrieval
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   $ref: '#/components/schemas/PageResponse'
 *       400:
 *         description: Invalid pagination parameters
 *       403:
 *         description: Unauthorized access
 *       500:
 *         description: Internal server error
 */
router.get('/news', validatePagination, adminNewsController.getAllNews);

/**
 * @swagger
 * /api/v1/admin/news/create:
 *   post:
 *     summary: Create a new news item (Admin)
 *     description: Create a new news item with optional image upload
 *     tags: [Admin News]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 255
 *                 example: "New Movie Release"
 *                 description: Title of the news
 *               content:
 *                 type: string
 *                 example: "Details about the new release..."
 *                 description: Content of the news
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: News image file
 *     responses:
 *       201:
 *         description: News created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 201
 *                 code:
 *                   type: integer
 *                   example: 201
 *                 data:
 *                   type: string
 *                   example: "News created successfully"
 *       400:
 *         description: Invalid input data
 *       403:
 *         description: Unauthorized access
 *       500:
 *         description: Internal server error
 */
router.post('/news/create', upload.single('image'), validateNews, adminNewsController.createNews);

/**
 * @swagger
 * /api/v1/admin/news/update/{id}:
 *   put:
 *     summary: Update a news item (Admin)
 *     description: Update a news item by ID with optional image upload
 *     tags: [Admin News]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: News ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 255
 *                 example: "Updated Movie Release"
 *                 description: Title of the news
 *               content:
 *                 type: string
 *                 example: "Updated details about the release..."
 *                 description: Content of the news
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: New news image file (optional)
 *     responses:
 *       200:
 *         description: News updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: string
 *                   example: "News updated successfully"
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: News not found
 *       403:
 *         description: Unauthorized access
 *       500:
 *         description: Internal server error
 */
router.put('/news/update/:id', upload.single('image'), validateNews, adminNewsController.updateNews);

/**
 * @swagger
 * /api/v1/admin/news/delete/{id}:
 *   delete:
 *     summary: Delete a news item (Admin)
 *     description: Delete a news item by ID
 *     tags: [Admin News]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: News ID
 *     responses:
 *       204:
 *         description: News deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 204
 *                 code:
 *                   type: integer
 *                   example: 204
 *                 message:
 *                   type: string
 *                   example: "News deleted successfully"
 *       404:
 *         description: News not found
 *       403:
 *         description: Unauthorized access
 *       500:
 *         description: Internal server error
 */
router.delete('/news/delete/:id', adminNewsController.deleteNews);

/**
 * @swagger
 * /api/v1/admin/news/{id}:
 *   get:
 *     summary: Get news by ID (Admin)
 *     description: Retrieve a specific news item by ID
 *     tags: [Admin News]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: News ID
 *     responses:
 *       200:
 *         description: Successful retrieval
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   $ref: '#/components/schemas/NewsResponse'
 *       404:
 *         description: News not found
 *       403:
 *         description: Unauthorized access
 *       500:
 *         description: Internal server error
 */
router.get('/news/:id', adminNewsController.getNewsById);

export default router;
