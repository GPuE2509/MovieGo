const express = require('express');
const router = express.Router();
const ticketPriceController = require('../../controllers/ticketPriceController');
const { auth, adminMiddleware } = require('../../middleware/auth');
const { createTicketPriceValidation, updateTicketPriceValidation, ticketPriceQueryValidation } = require('../../dto/request/ticketPriceDto');

router.get('/ticket-prices', auth, adminMiddleware, ticketPriceQueryValidation, ticketPriceController.getAll);
router.get('/ticket-price/:id', auth, adminMiddleware,ticketPriceQueryValidation, ticketPriceController.getById);
router.post('/ticket-price/create', auth, adminMiddleware, createTicketPriceValidation, ticketPriceController.create);
router.put('/ticket-price/update/:id', auth, adminMiddleware, updateTicketPriceValidation, ticketPriceController.update);
router.delete('/ticket-price/delete/:id', auth, adminMiddleware, ticketPriceController.delete);

module.exports = router;
