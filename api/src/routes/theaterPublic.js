const express = require('express');
const router = express.Router();
const theaterController = require('../controllers/theaterController');

// Public: Get theater by ID
router.get('/theater/:id', theaterController.getById);

module.exports = router;
