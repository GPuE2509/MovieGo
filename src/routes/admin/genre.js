import express from 'express';
import adminGenreController from '../../controllers/admin/genreController.js';
import { validateGenre } from '../../validators/genreValidator.js';

const router = express.Router();

/**
 * @swagger
 * /api/v1/admin/genres:
 *   get:
 *     summary: Get all genres (Admin)
 *     description: Retrieve a list of all genres
 *     tags: [Admin Genres]
 *     security:
 *       - bearerAuth: []
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
 *                     $ref: '#/components/schemas/GenreResponse'
 *       403:
 *         description: Unauthorized access
 *       500:
 *         description: Internal server error
 */
router.get('/genres', adminGenreController.getAllGenres);

/**
 * @swagger
 * /api/v1/admin/genre/create:
 *   post:
 *     summary: Create a new genre (Admin)
 *     description: Create a new genre
 *     tags: [Admin Genres]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - genreName
 *             properties:
 *               genreName:
 *                 type: string
 *                 maxLength: 100
 *                 example: "Action"
 *                 description: Name of the genre
 *     responses:
 *       201:
 *         description: Genre created successfully
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
 *                   $ref: '#/components/schemas/GenreResponse'
 *       400:
 *         description: Invalid input data
 *       409:
 *         description: Genre name already exists
 *       403:
 *         description: Unauthorized access
 *       500:
 *         description: Internal server error
 */
router.post('/genre/create', validateGenre, adminGenreController.addGenre);

/**
 * @swagger
 * /api/v1/admin/genre/update/{id}:
 *   put:
 *     summary: Update a genre (Admin)
 *     description: Update a genre by ID
 *     tags: [Admin Genres]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Genre ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - genreName
 *             properties:
 *               genreName:
 *                 type: string
 *                 maxLength: 100
 *                 example: "Action Adventure"
 *                 description: Name of the genre
 *     responses:
 *       200:
 *         description: Genre updated successfully
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
 *                   $ref: '#/components/schemas/GenreResponse'
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: Genre not found
 *       409:
 *         description: Genre name already exists
 *       403:
 *         description: Unauthorized access
 *       500:
 *         description: Internal server error
 */
router.put('/genre/update/:id', validateGenre, adminGenreController.updateGenre);

/**
 * @swagger
 * /api/v1/admin/genre/delete/{id}:
 *   delete:
 *     summary: Delete a genre (Admin)
 *     description: Delete a genre by ID
 *     tags: [Admin Genres]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Genre ID
 *     responses:
 *       204:
 *         description: Genre deleted successfully
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
 *                   example: "Genre deleted successfully"
 *       404:
 *         description: Genre not found
 *       403:
 *         description: Unauthorized access
 *       500:
 *         description: Internal server error
 */
router.delete('/genre/delete/:id', adminGenreController.deleteGenre);

export default router;
