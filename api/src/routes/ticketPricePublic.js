const express = require('express');
const router = express.Router();
const ticketPricePublicController = require('../controllers/ticketPricePublicController');

router.get('/ticket-prices', ticketPricePublicController.getTicketPrice);
router.get('/ticket-price/applicable/:showtimeId', ticketPricePublicController.getApplicable);

module.exports = router;
