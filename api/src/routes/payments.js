const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");

// VNPay routes
router.get("/vnpay/return", (req, res) => paymentController.vnpayReturn(req, res));
// IPN supports both GET and POST (VNPay may use either)
router.get("/vnpay/ipn", (req, res) => paymentController.vnpayIpn(req, res));
router.post("/vnpay/ipn", (req, res) => paymentController.vnpayIpn(req, res));

// MoMo routes
router.get("/momo/return", (req, res) => paymentController.momoReturn(req, res));
// IPN supports both GET and POST (MoMo may use POST with body or GET with query)
router.get("/momo/ipn", (req, res) => paymentController.momoIpn(req, res));
router.post("/momo/ipn", (req, res) => paymentController.momoIpn(req, res));

module.exports = router;


