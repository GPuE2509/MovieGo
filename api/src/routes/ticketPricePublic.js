const express = require('express');
const router = express.Router();
const ticketPricePublicController = require('../controllers/ticketPricePublicController');
const { ticketPricePublicQueryValidation, applicableTicketPriceQueryValidation } = require('../dto/request/ticketPriceDto');

router.get('/ticket-prices', ticketPricePublicQueryValidation, ticketPricePublicController.getTicketPrice);
router.get('/ticket-price/applicable/:showtimeId', applicableTicketPriceQueryValidation, ticketPricePublicController.getApplicable);

module.exports = router;
