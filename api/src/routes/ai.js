const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { generateEventContent } = require('../controllers/aiController');

/**
 * @route POST /api/ai/generate/:movieId
 * @desc Generate AI content (description and image prompt) for movie event
 * @access Private
 * @body {
 *   eventTheme: string // Required - theme of the event (e.g., "Premiere Night", "Special Screening", "Holiday Event")
 * }
 * @response {
 *   success: boolean,
 *   data: {
 *     movieId: string,
 *     movieTitle: string,
 *     eventTheme: string,
 *     generatedContent: {
 *       description: string,
 *       slogan: string,
 *       callToAction: string,
 *       imagePrompt: string
 *     },
 *     timestamp: string
 *   }
 * }
 */
router.post('/generate/:movieId', auth, generateEventContent);

/**
 * @route GET /api/ai/health
 * @desc Check AI service status
 * @access Public
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'AI Service is running',
    timestamp: new Date().toISOString(),
    service: 'Google Generative AI',
    model: 'gemini-1.5-flash'
  });
});

module.exports = router;