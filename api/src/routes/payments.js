const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Xử lý thanh toán VNPay, MoMo
 */

/**
 * @swagger
 * /api/v1/payments/vnpay/return:
 *   get:
 *     summary: Xử lý trả về từ VNPay
 *     tags: [Payments]
 *     responses:
 *       200:
 *         description: Kết quả trả về từ VNPay
 */

/**
 * @swagger
 * /api/v1/payments/vnpay/ipn:
 *   get:
 *     summary: Xử lý IPN từ VNPay (GET)
 *     tags: [Payments]
 *     responses:
 *       200:
 *         description: Kết quả IPN VNPay
 *   post:
 *     summary: Xử lý IPN từ VNPay (POST)
 *     tags: [Payments]
 *     responses:
 *       200:
 *         description: Kết quả IPN VNPay
 */

/**
 * @swagger
 * /api/v1/payments/momo/return:
 *   get:
 *     summary: Xử lý trả về từ MoMo
 *     tags: [Payments]
 *     responses:
 *       200:
 *         description: Kết quả trả về từ MoMo
 */

/**
 * @swagger
 * /api/v1/payments/momo/ipn:
 *   get:
 *     summary: Xử lý IPN từ MoMo (GET)
 *     tags: [Payments]
 *     responses:
 *       200:
 *         description: Kết quả IPN MoMo
 *   post:
 *     summary: Xử lý IPN từ MoMo (POST)
 *     tags: [Payments]
 *     responses:
 *       200:
 *         description: Kết quả IPN MoMo
 */

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


