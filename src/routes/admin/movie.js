import express from 'express';
import multer from 'multer';
import adminMovieController from '../../controllers/admin/movieController.js';
import { validateMovie, validateQuery, createMovieSchema, updateMovieSchema } from '../../validators/movieValidator.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

/**
 * @swagger
 * /api/v1/admin/movies:
 *   get:
 *     summary: Get all movies (Admin)
 *     description: Retrieve a paginated list of movies with optional filters
 *     tags: [Admin Movies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         description: Filter by title
 *       - in: query
 *         name: author
 *         schema:
 *           type: string
 *         description: Filter by author
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Sort field
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
 *         description: Invalid pagination parameters
 *       403:
 *         description: Unauthorized access
 *       500:
 *         description: Internal server error
 */
router.get('/movies', validateQuery, adminMovieController.getAllMovies);

/**
 * @swagger
 * /api/v1/admin/movie/{id}:
 *   get:
 *     summary: Get movie by ID (Admin)
 *     description: Retrieve a specific movie by its ID
 *     tags: [Admin Movies]
 *     security:
 *       - bearerAuth: []
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
 *       403:
 *         description: Unauthorized access
 *       500:
 *         description: Internal server error
 */
router.get('/movie/:id', adminMovieController.getMovieById);

/**
 * @swagger
 * /api/v1/admin/movie/create:
 *   post:
 *     summary: Create a new movie (Admin)
 *     description: Create a new movie with optional image upload to Cloudinary
 *     tags: [Admin Movies]
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
 *               - author
 *               - type
 *               - duration
 *               - releaseDate
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 255
 *                 example: "Inception"
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *                 example: "A mind-bending thriller..."
 *               author:
 *                 type: string
 *                 maxLength: 100
 *                 example: "Christopher Nolan"
 *               actors:
 *                 type: string
 *                 maxLength: 1000
 *                 example: "Leonardo DiCaprio, Ellen Page"
 *               nation:
 *                 type: string
 *                 maxLength: 100
 *                 example: "USA"
 *               trailer:
 *                 type: string
 *                 format: uri
 *                 example: "https://youtube.com/watch?v=example"
 *               type:
 *                 type: string
 *                 enum: [2D, 3D, 4DX, IMAX]
 *                 example: "3D"
 *               duration:
 *                 type: integer
 *                 minimum: 1
 *                 example: 148
 *               releaseDate:
 *                 type: string
 *                 format: date
 *                 example: "2023-06-16"
 *               genreIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2, 3]
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Movie image file
 *     responses:
 *       201:
 *         description: Movie created successfully
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
 *                   $ref: '#/components/schemas/Movie'
 *       400:
 *         description: Invalid input data
 *       403:
 *         description: Unauthorized access
 *       500:
 *         description: Error uploading image to Cloudinary
 */
router.post('/movie/create', upload.single('image'), validateMovie(createMovieSchema), adminMovieController.createMovie);

/**
 * @swagger
 * /api/v1/admin/movie/update/{id}:
 *   put:
 *     summary: Update movie details (Admin)
 *     description: Update movie information (excluding image)
 *     tags: [Admin Movies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Movie ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - author
 *               - type
 *               - duration
 *               - releaseDate
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 255
 *                 example: "Inception"
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *                 example: "A mind-bending thriller..."
 *               author:
 *                 type: string
 *                 maxLength: 100
 *                 example: "Christopher Nolan"
 *               trailer:
 *                 type: string
 *                 format: uri
 *                 example: "https://youtube.com/watch?v=example"
 *               type:
 *                 type: string
 *                 enum: [2D, 3D, 4DX, IMAX]
 *                 example: "3D"
 *               duration:
 *                 type: integer
 *                 minimum: 1
 *                 example: 148
 *               releaseDate:
 *                 type: string
 *                 format: date
 *                 example: "2023-06-16"
 *               genreIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2, 3]
 *     responses:
 *       200:
 *         description: Movie updated successfully
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
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: Movie not found
 *       403:
 *         description: Unauthorized access
 *       500:
 *         description: Internal server error
 */
router.put('/movie/update/:id', validateMovie(updateMovieSchema), adminMovieController.updateMovie);

/**
 * @swagger
 * /api/v1/admin/movie/update/image/{id}:
 *   patch:
 *     summary: Update movie image (Admin)
 *     description: Update movie image separately
 *     tags: [Admin Movies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Movie ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Movie image file
 *     responses:
 *       200:
 *         description: Image updated successfully
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
 *       400:
 *         description: Invalid image file
 *       404:
 *         description: Movie not found
 *       403:
 *         description: Unauthorized access
 *       500:
 *         description: Internal server error
 */
router.patch('/movie/update/image/:id', upload.single('image'), adminMovieController.updateMovieImage);

/**
 * @swagger
 * /api/v1/admin/movie/delete/{id}:
 *   delete:
 *     summary: Delete a movie (Admin)
 *     description: Delete a movie by ID
 *     tags: [Admin Movies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Movie ID
 *     responses:
 *       200:
 *         description: Movie deleted successfully
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
 *                 message:
 *                   type: string
 *                   example: "Movie deleted successfully"
 *       404:
 *         description: Movie not found
 *       403:
 *         description: Unauthorized access
 *       500:
 *         description: Internal server error
 */
router.delete('/movie/delete/:id', adminMovieController.deleteMovie);

export default router;
