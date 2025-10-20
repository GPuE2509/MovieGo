const express = require('express');
const router = express.Router();
const theaterController = require('../../controllers/theaterController');
const { auth, adminMiddleware } = require('../../middleware/auth');
const { theaterQueryValidation, createTheaterValidation, updateTheaterValidation } = require('../../dto/request/theaterDto');

// Get all theaters (list)
router.get('/theaters', auth, adminMiddleware, theaterQueryValidation, theaterController.list);

// Get a theater by id
router.get('/theater/:id', auth, adminMiddleware, theaterController.getById);

// Create a theater
router.post('/theater/create', auth, adminMiddleware, createTheaterValidation, theaterController.create);

// Update a theater
router.put('/theater/update/:id', auth, adminMiddleware, updateTheaterValidation, theaterController.update);

// Delete a theater
router.delete('/theater/delete/:id', auth, adminMiddleware, theaterController.remove);

module.exports = router;
