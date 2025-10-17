import express from 'express';
import theaterController from '../controllers/theaterController.js';
import { validatePagination, validateNearbyTheaters } from '../validators/theaterValidator.js';

const router = express.Router();

/**
 * @swagger
 * /api/v1/theaters:
 *   get:
 *     summary: Get all theaters (Public)
 *     description: Retrieve a paginated list of theaters with optional search
 *     tags: [Public Theaters]
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: Search keyword for name, location, or state
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
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: name
 *           enum: [name, location, state, createdAt, updatedAt]
 *         description: Field to sort by
 *       - in: query
 *         name: direction
 *         schema:
 *           type: string
 *           default: asc
 *           enum: [asc, desc]
 *         description: Sort direction
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
router.get('/theaters', validatePagination, theaterController.getAllTheaters);

/**
 * @swagger
 * /api/v1/theater/{id}:
 *   get:
 *     summary: Get theater by ID (Public)
 *     description: Retrieve a specific theater by ID
 *     tags: [Public Theaters]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Theater ID
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
 *                   $ref: '#/components/schemas/TheaterResponse'
 *       404:
 *         description: Theater not found
 *       500:
 *         description: Internal server error
 */
router.get('/theater/:id', theaterController.getTheaterById);

/**
 * @swagger
 * /api/v1/theaters-near:
 *   get:
 *     summary: Get theaters near a location (Public)
 *     description: Retrieve theaters based on user's latitude, longitude, a search radius in kilometers, and a specific date
 *     tags: [Public Theaters]
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *           minimum: -90
 *           maximum: 90
 *         description: User's latitude
 *       - in: query
 *         name: lon
 *         required: true
 *         schema:
 *           type: number
 *           minimum: -180
 *           maximum: 180
 *         description: User's longitude
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           default: 5
 *           minimum: 1
 *         description: Search radius in kilometers
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Specific date to check for showtimes
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *         description: Maximum number of theaters to return
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
 *                     allOf:
 *                       - $ref: '#/components/schemas/TheaterResponse'
 *                       - type: object
 *                         properties:
 *                           distance:
 *                             type: number
 *                             description: Distance from user location in kilometers
 *       400:
 *         description: Invalid parameters
 *       500:
 *         description: Internal server error
 */
router.get('/theaters-near', validateNearbyTheaters, theaterController.getTheatersNear);

export default router;
