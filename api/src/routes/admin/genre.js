const express = require('express');
const router = express.Router();
const genreController = require('../../controllers/genreController');
const { auth, adminMiddleware } = require('../../middleware/auth');
const { queryValidation, createGenreValidation, updateGenreValidation } = require('../../dto/request/genreDto');

// List genres
router.get('/genres', auth, adminMiddleware, queryValidation, genreController.list);

// Create
router.post('/genre/create', auth, adminMiddleware, createGenreValidation, genreController.create);

// Update
router.put('/genre/update/:id', auth, adminMiddleware, updateGenreValidation, genreController.update);

// Delete
router.delete('/genre/delete/:id', auth, adminMiddleware, genreController.remove);

module.exports = router;
