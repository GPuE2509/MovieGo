const express = require('express');
const router = express.Router();
const movieController = require('../../controllers/movieController');
const upload = require('../../middleware/upload');
const { auth, adminMiddleware } = require('../../middleware/auth');
const {
  movieQueryValidation,
  createMovieValidation,
  updateMovieValidation
} = require('../../dto/request/movieDto');

// List movies (admin)
router.get('/movies', auth, adminMiddleware, movieQueryValidation, movieController.getAllMovies);

// Get by id (admin)
router.get('/movie/:id', auth, adminMiddleware, movieController.getMovieById);

// Create (admin) - multipart/form-data
router.post('/movie/create', auth, adminMiddleware, upload.single('image'), createMovieValidation, movieController.createMovie);

// Update details (admin)
router.put('/movie/update/:id', auth, adminMiddleware, updateMovieValidation, movieController.updateMovie);

// Update image (admin) - multipart/form-data
router.patch('/movie/update/image/:id', auth, adminMiddleware, upload.single('image'), movieController.updateMovieImage);

// Delete (admin)
router.delete('/movie/delete/:id', auth, adminMiddleware, movieController.deleteMovie);

// Extra: genres list for admin forms
router.get('/genres', auth, adminMiddleware, async (req, res) => {
  try {
    const movieService = require('../../services/movieService');
    const genres = await movieService.getAllGenres();
    res.status(200).json({ success: true, data: genres });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
