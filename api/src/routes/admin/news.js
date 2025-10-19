const express = require('express');
const router = express.Router();
const newsController = require('../../controllers/newsController');
const { auth, adminMiddleware } = require('../../middleware/auth');
const { newsQueryValidation, createNewsValidation, updateNewsValidation } = require('../../dto/request/newsDto');

// Get all news (list)
router.get('/news', auth, adminMiddleware, newsQueryValidation, newsController.list);

// Create a news item
router.post('/news/create', auth, adminMiddleware, createNewsValidation, newsController.create);

// Update a news item
router.put('/news/update/:id', auth, adminMiddleware, updateNewsValidation, newsController.update);

// Delete a news item
router.delete('/news/delete/:id', auth, adminMiddleware, newsController.remove);

module.exports = router;
