const Payment = require("../models/payment");
const paymentGatewayRegistry = require("../services/paymentGatewayRegistry");
const { syncBookingStatusWithPayment } = require("../services/paymentStatusSyncService");

function redirect(res, baseUrl, status, code, data) {
  const url = new URL(baseUrl);
  url.searchParams.set("status", status);
  url.searchParams.set("code", String(code));
  url.searchParams.set("data", data);
  res.setHeader("Location", url.toString());
  res.status(303).end();
}

const frontendBaseUrl = process.env.FRONTEND_BASE_URL || "http://localhost:3000/"; // ensure trailing slash

class PaymentController {
  async vnpayReturn(req, res) {
    try {
      const gateway = paymentGatewayRegistry.get("VNPAY");
      // Extract raw query string from URL (before Express decoding)
      // VNPay calculates hash from raw query string with original encoding
      const rawQueryString = req.originalUrl?.split('?')[1] || req.url?.split('?')[1] || null;
      const result = await gateway.handleCallback(req.query, rawQueryString);
      const payment = await Payment.findOne({ transaction_id: result.transactionId });
      if (!payment) throw new Error("Payment not found");
      payment.payment_status = result.status;
      if (result.status === "COMPLETED") payment.payment_time = new Date();
      await payment.save();
      await syncBookingStatusWithPayment(payment.booking_id);
      const success = result.status === "COMPLETED";
      const target = success ? frontendBaseUrl + "payment-success" : frontendBaseUrl + "payment-failure";
      redirect(res, target, success ? "OK" : "BAD_REQUEST", success ? 200 : 400, success ? "VNPAY payment completed successfully" : "VNPAY payment failed");
    } catch (e) {
      const target = frontendBaseUrl + "payment-failure";
      redirect(res, target, "BAD_REQUEST", 400, e.message || "Failed to process VNPAY callback");
    }
  }

  async vnpayIpn(req, res) {
    // IPN is server-to-server callback from VNPay
    // Must return status code text immediately (not redirect)
    // VNPay may send params via GET (query) or POST (body)
    try {
      const gateway = paymentGatewayRegistry.get("VNPAY");
      // Get params from either query (GET) or body (POST)
      const params = Object.keys(req.query).length > 0 ? req.query : (req.body || {});
      // Extract raw query string from URL (for GET) or raw body (for POST)
      let rawQueryString = null;
      if (Object.keys(req.query).length > 0) {
        rawQueryString = req.originalUrl?.split('?')[1] || req.url?.split('?')[1] || null;
      } else if (req.body && typeof req.body === 'string') {
        // POST with raw body (query string format)
        rawQueryString = req.body;
      }
      const result = await gateway.handleCallback(params, rawQueryString);
      const payment = await Payment.findOne({ transaction_id: result.transactionId });
      if (!payment) {
        // Return error code to VNPay
        return res.status(400).send("Order not found");
      }
      
      // Update payment status
      payment.payment_status = result.status;
      if (result.status === "COMPLETED") {
        payment.payment_time = new Date();
      }
      await payment.save();
      
      // Sync booking status (async, don't wait)
      syncBookingStatusWithPayment(payment.booking_id).catch(err => {
        console.error("Failed to sync booking status:", err);
      });
      
      // Return success code to VNPay
      // VNPay expects: "00" = success, other = error
      return res.status(200).send("00");
    } catch (e) {
      console.error("VNPay IPN error:", e);
      // Return error code to VNPay
      return res.status(400).send("Invalid signature");
    }
  }

  async momoReturn(req, res) {
    try {
      const gateway = paymentGatewayRegistry.get("MOMO");
      // MoMo Return URL may send params via query string or both query and body
      // Combine them, with query taking precedence
      const params = { ...req.body, ...req.query };
      
      console.log("MoMo Return callback received:", params);
      
      const result = await gateway.handleCallback(params);
      const payment = await Payment.findOne({ transaction_id: result.transactionId });
      if (!payment) throw new Error("Payment not found");
      payment.payment_status = result.status;
      if (result.status === "COMPLETED") payment.payment_time = new Date();
      await payment.save();
      await syncBookingStatusWithPayment(payment.booking_id);
      const success = result.status === "COMPLETED";
      const target = success ? frontendBaseUrl + "payment-success" : frontendBaseUrl + "payment-failure";
      redirect(res, target, success ? "OK" : "BAD_REQUEST", success ? 200 : 400, success ? "MOMO payment completed successfully" : "MOMO payment failed");
    } catch (e) {
      console.error("MoMo Return callback error:", e.message);
      console.error("MoMo Return params:", { query: req.query, body: req.body });
      const target = frontendBaseUrl + "payment-failure";
      redirect(res, target, "BAD_REQUEST", 400, e.message || "Failed to process MOMO callback");
    }
  }

  async momoIpn(req, res) {
    // IPN is server-to-server callback from MoMo
    // Must return JSON response immediately (not redirect)
    // MoMo may send params via GET (query) or POST (body)
    try {
      const gateway = paymentGatewayRegistry.get("MOMO");
      // Combine query and body params (query takes precedence)
      const params = { ...req.body, ...req.query };
      
      console.log("MoMo IPN callback received:", params);
      
      const result = await gateway.handleCallback(params);
      const payment = await Payment.findOne({ transaction_id: result.transactionId });
      if (!payment) {
        return res.status(400).json({ message: "Order not found" });
      }
      
      // Update payment status
      payment.payment_status = result.status;
      if (result.status === "COMPLETED") {
        payment.payment_time = new Date();
      }
      await payment.save();
      
      // Sync booking status (async, don't wait)
      syncBookingStatusWithPayment(payment.booking_id).catch(err => {
        console.error("Failed to sync booking status:", err);
      });
      
      // Return success to MoMo
      return res.status(200).json({ message: "Success" });
    } catch (e) {
      console.error("MoMo IPN error:", e);
      return res.status(400).json({ message: e.message || "Invalid signature" });
    }
  }
}

module.exports = new PaymentController();
