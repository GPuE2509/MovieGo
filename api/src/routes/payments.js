const express = require('express');
const router = express.Router();
const controller = require('../controllers/paymentForUserController');

// Public: list active payment methods
router.get('/methods', (req, res) => controller.getPaymentMethods(req, res));

// Gateways callbacks
router.get('/vnpay/return', (req, res) => controller.handleVNPayReturn(req, res));
router.get('/vnpay/ipn', (req, res) => controller.handleVNPayIPN(req, res));
router.get('/momo/return', (req, res) => controller.handleMoMoReturn(req, res));
router.get('/momo/ipn', (req, res) => controller.handleMoMoIPN(req, res));

module.exports = router;


