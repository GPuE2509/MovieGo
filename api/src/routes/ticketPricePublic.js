const express = require('express');
const router = express.Router();
const ticketPricePublicController = require('../controllers/ticketPricePublicController');
const { ticketPricePublicQueryValidation, applicableTicketPriceQueryValidation } = require('../dto/request/ticketPriceDto');

/**
 * @swagger
 * tags:
 *   name: TicketPricePublic
 *   description: Xem giá vé công khai
 */

/**
 * @swagger
 * /api/v1/ticket-prices:
 *   get:
 *     summary: Lấy danh sách giá vé
 *     tags: [TicketPricePublic]
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *         description: Ngày xem giá vé
 *     responses:
 *       200:
 *         description: Danh sách giá vé
 */

/**
 * @swagger
 * /api/v1/ticket-price/applicable/{showtimeId}:
 *   get:
 *     summary: Lấy giá vé áp dụng cho suất chiếu
 *     tags: [TicketPricePublic]
 *     parameters:
 *       - in: path
 *         name: showtimeId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID suất chiếu
 *     responses:
 *       200:
 *         description: Giá vé áp dụng
 */

router.get('/ticket-prices', ticketPricePublicQueryValidation, ticketPricePublicController.getTicketPrice);
router.get('/ticket-price/applicable/:showtimeId', applicableTicketPriceQueryValidation, ticketPricePublicController.getApplicable);

module.exports = router;
