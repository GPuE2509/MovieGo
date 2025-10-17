import express from 'express';
import newsController from '../controllers/newsController.js';
import { validatePagination } from '../validators/newsValidator.js';

const router = express.Router();

/**
 * @swagger
 * /api/v1/get-all-news:
 *   get:
 *     summary: Get all news (Public)
 *     description: Retrieve a paginated list of news with optional search
 *     tags: [Public News]
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
 *       500:
 *         description: Internal server error
 */
router.get('/get-all-news', validatePagination, newsController.getAllNews);

/**
 * @swagger
 * /api/v1/get-new-by-id/{id}:
 *   get:
 *     summary: Get news by ID (Public)
 *     description: Retrieve a specific news item by ID
 *     tags: [Public News]
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
 *       500:
 *         description: Internal server error
 */
router.get('/get-new-by-id/:id', newsController.getNewsById);

/**
 * @swagger
 * /api/v1/news/carousel:
 *   get:
 *     summary: Get news for carousel (Public)
 *     description: Retrieve latest 9 news items for carousel display
 *     tags: [Public News]
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
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/NewsResponse'
 *       500:
 *         description: Internal server error
 */
router.get('/news/carousel', newsController.getNewsForCarousel);

export default router;
