import express from 'express';
import multer from 'multer';
import adminTheaterController from '../../controllers/admin/theaterController.js';
import { validateTheater, validatePagination } from '../../validators/theaterValidator.js';

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
 * /api/v1/admin/theaters:
 *   get:
 *     summary: Get all theaters (Admin)
 *     description: Retrieve a paginated list of theaters with optional search
 *     tags: [Admin Theaters]
 *     security:
 *       - bearerAuth: []
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
 *       403:
 *         description: Unauthorized access
 *       500:
 *         description: Internal server error
 */
router.get('/theaters', validatePagination, adminTheaterController.getAllTheaters);

/**
 * @swagger
 * /api/v1/admin/theater/{id}:
 *   get:
 *     summary: Get theater by ID (Admin)
 *     description: Retrieve a specific theater by ID
 *     tags: [Admin Theaters]
 *     security:
 *       - bearerAuth: []
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
 *       403:
 *         description: Unauthorized access
 *       500:
 *         description: Internal server error
 */
router.get('/theater/:id', adminTheaterController.getTheaterById);

/**
 * @swagger
 * /api/v1/admin/theater/create:
 *   post:
 *     summary: Create a new theater (Admin)
 *     description: Create a new theater with image upload
 *     tags: [Admin Theaters]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - location
 *               - phone
 *               - latitude
 *               - longitude
 *               - state
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *                 example: "Cinema World"
 *                 description: Name of the theater
 *               location:
 *                 type: string
 *                 example: "123 Movie St, Hanoi"
 *                 description: Location of the theater
 *               phone:
 *                 type: string
 *                 pattern: "^[0-9]{8,11}$"
 *                 example: "19006017"
 *                 description: Phone number of the theater
 *               latitude:
 *                 type: number
 *                 minimum: -90
 *                 maximum: 90
 *                 example: 10.8015
 *                 description: Latitude of the theater
 *               longitude:
 *                 type: number
 *                 minimum: -180
 *                 maximum: 180
 *                 example: 106.6367
 *                 description: Longitude of the theater
 *               state:
 *                 type: string
 *                 maxLength: 50
 *                 example: "Ho Chi Minh City"
 *                 description: State or province of the theater
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Theater image file
 *     responses:
 *       201:
 *         description: Theater created successfully
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
 *                   $ref: '#/components/schemas/TheaterResponse'
 *       400:
 *         description: Invalid input data
 *       409:
 *         description: Theater name already exists
 *       403:
 *         description: Unauthorized access
 *       500:
 *         description: Internal server error
 */
router.post('/theater/create', upload.single('image'), validateTheater, adminTheaterController.createTheater);

/**
 * @swagger
 * /api/v1/admin/theater/update/{id}:
 *   put:
 *     summary: Update a theater (Admin)
 *     description: Update a theater by ID with optional image upload
 *     tags: [Admin Theaters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Theater ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - location
 *               - phone
 *               - latitude
 *               - longitude
 *               - state
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *                 example: "Updated Cinema World"
 *                 description: Name of the theater
 *               location:
 *                 type: string
 *                 example: "456 Updated St, Hanoi"
 *                 description: Location of the theater
 *               phone:
 *                 type: string
 *                 pattern: "^[0-9]{8,11}$"
 *                 example: "19006018"
 *                 description: Phone number of the theater
 *               latitude:
 *                 type: number
 *                 minimum: -90
 *                 maximum: 90
 *                 example: 10.8016
 *                 description: Latitude of the theater
 *               longitude:
 *                 type: number
 *                 minimum: -180
 *                 maximum: 180
 *                 example: 106.6368
 *                 description: Longitude of the theater
 *               state:
 *                 type: string
 *                 maxLength: 50
 *                 example: "Hanoi"
 *                 description: State or province of the theater
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: New theater image file (optional)
 *     responses:
 *       200:
 *         description: Theater updated successfully
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
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: Theater not found
 *       409:
 *         description: Theater name already exists
 *       403:
 *         description: Unauthorized access
 *       500:
 *         description: Internal server error
 */
router.put('/theater/update/:id', upload.single('image'), validateTheater, adminTheaterController.updateTheater);

/**
 * @swagger
 * /api/v1/admin/theater/delete/{id}:
 *   delete:
 *     summary: Delete a theater (Admin)
 *     description: Delete a theater by ID (soft delete)
 *     tags: [Admin Theaters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Theater ID
 *     responses:
 *       204:
 *         description: Theater deleted successfully
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
 *                   example: "Theater deleted successfully"
 *       404:
 *         description: Theater not found
 *       403:
 *         description: Unauthorized access
 *       500:
 *         description: Internal server error
 */
router.delete('/theater/delete/:id', adminTheaterController.deleteTheater);

export default router;
