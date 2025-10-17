import express from 'express';
import movieController from '../controllers/movieController.js';
import { validateQuery } from '../validators/movieValidator.js';

const router = express.Router();

/**
 * @swagger
 * /api/v1/movies:
 *   get:
 *     summary: Get movies with active showtimes
 *     description: Retrieve a paginated list of movies that have active showtimes
 *     tags: [Public Movies]
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by date
 *       - in: query
 *         name: theaterId
 *         schema:
 *           type: integer
 *         description: Filter by theater ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Page number
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Page size
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
 *                   type: object
 *                   properties:
 *                     content:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Movie'
 *                     totalElements:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     size:
 *                       type: integer
 *                     number:
 *                       type: integer
 *                     first:
 *                       type: boolean
 *                     last:
 *                       type: boolean
 *                     numberOfElements:
 *                       type: integer
 *       400:
 *         description: Invalid query parameters
 *       500:
 *         description: Internal server error
 */
router.get('/', validateQuery, movieController.getMoviesWithShowtimes);

/**
 * @swagger
 * /api/v1/movies/{id}:
 *   get:
 *     summary: Get movie details
 *     description: Retrieve detailed information of a specific movie by its ID
 *     tags: [Public Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Movie ID
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
 *                   $ref: '#/components/schemas/Movie'
 *       404:
 *         description: Movie not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', movieController.getMovieDetails);

export default router;
