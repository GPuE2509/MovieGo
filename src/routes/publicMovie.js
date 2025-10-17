import express from 'express';
import publicMovieController from '../controllers/publicMovieController.js';
import { validatePagination, validateDate, validateTheaterId, validateMovieId, validateNow } from '../validators/publicMovieValidator.js';

const router = express.Router();

/**
 * @swagger
 * /api/v1/movies:
 *   get:
 *     summary: Get movies with active showtimes (Public)
 *     description: Retrieve a paginated list of movies that have active showtimes, with optional filters for date and theater
 *     tags: [Public Movies]
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter movies by showtime date (defaults to current date)
 *       - in: query
 *         name: theaterId
 *         schema:
 *           type: integer
 *         description: Filter movies by specific theater
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Page number (0-based)
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
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
router.get('/', validatePagination, validateDate, validateTheaterId, publicMovieController.getMoviesWithShowtimes);

/**
 * @swagger
 * /api/v1/movies/{id}:
 *   get:
 *     summary: Get movie details (Public)
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
 *                   $ref: '#/components/schemas/MovieResponse'
 *       404:
 *         description: Movie not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', validateMovieId, publicMovieController.getMovieDetails);

/**
 * @swagger
 * /api/v1/movies/showing:
 *   get:
 *     summary: Get movies currently showing (Public)
 *     description: Retrieve movies that are currently showing (released and have showtimes this week)
 *     tags: [Public Movies]
 *     parameters:
 *       - in: query
 *         name: now
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Current date/time (defaults to actual current time)
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
 *                     $ref: '#/components/schemas/MovieResponse'
 *       500:
 *         description: Internal server error
 */
router.get('/showing', validateNow, publicMovieController.getMoviesShowing);

/**
 * @swagger
 * /api/v1/movies/coming:
 *   get:
 *     summary: Get movies coming soon (Public)
 *     description: Retrieve movies that are coming soon (release date in the future)
 *     tags: [Public Movies]
 *     parameters:
 *       - in: query
 *         name: now
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Current date/time (defaults to actual current time)
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
 *                     $ref: '#/components/schemas/MovieResponse'
 *       500:
 *         description: Internal server error
 */
router.get('/coming', validateNow, publicMovieController.getMoviesComing);

/**
 * @swagger
 * /api/v1/movies/{id}/trailer:
 *   get:
 *     summary: Get movie trailer (Public)
 *     description: Retrieve the trailer URL for a specific movie
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
 *                   type: string
 *                   description: Trailer URL
 *       404:
 *         description: Movie not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id/trailer', validateMovieId, publicMovieController.getMovieTrailer);

export default router;
