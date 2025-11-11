const express = require('express');
const router = express.Router();
const theaterController = require('../controllers/theaterController');

/**
 * @swagger
 * tags:
 *   name: TheaterPublic
 *   description: Xem thông tin rạp công khai
 */

/**
 * @swagger
 * /api/v1/theater/:id:
 *   get:
 *     summary: Lấy thông tin rạp theo ID
 *     tags: [TheaterPublic]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID rạp
 *     responses:
 *       200:
 *         description: Thông tin rạp
 *       404:
 *         description: Không tìm thấy rạp
 */

// Public: Get theater by ID
router.get('/theater/:id', theaterController.getById);

module.exports = router;
