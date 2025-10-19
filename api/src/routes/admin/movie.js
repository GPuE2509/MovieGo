const express = require('express');
const router = express.Router();
const movieController = require('../../controllers/movieController');
const upload = require('../../middleware/upload');
const { auth } = require('../../middleware/auth');
const {
  movieQueryValidation,
  createMovieValidation,
  updateMovieValidation
} = require('../../dto/request/movieDto');

// List movies (admin)
router.get('/movies', auth, movieQueryValidation, movieController.getAllMovies);

// Get by id (admin)
router.get('/movie/:id', auth, movieController.getMovieById);

// Create (admin) - multipart/form-data
router.post('/movie/create', auth, upload.single('image'), createMovieValidation, movieController.createMovie);

// Update details (admin)
router.put('/movie/update/:id', auth, updateMovieValidation, movieController.updateMovie);

// Update image (admin) - multipart/form-data
router.patch('/movie/update/image/:id', auth, upload.single('image'), movieController.updateMovieImage);

// Delete (admin)
router.delete('/movie/delete/:id', auth, movieController.deleteMovie);

// Extra: genres list for admin forms
router.get('/genres', auth, async (req, res) => {
  try {
    const movieService = require('../../services/movieService');
    const genres = await movieService.getAllGenres();
    res.status(200).json({ success: true, data: genres });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
