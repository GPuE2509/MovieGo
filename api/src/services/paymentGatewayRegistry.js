const vnpayService = require("./payments/vnpayService");
const momoService = require("./payments/momoService");

const registry = new Map();
registry.set("VNPAY", vnpayService);
registry.set("MOMO", momoService);

function get(paymentMethodName) {
  if (!paymentMethodName) {
    throw new Error("Payment method name cannot be null");
  }
  const service = registry.get(String(paymentMethodName).toUpperCase());
  if (!service) {
    throw new Error(`Unsupported payment method: ${paymentMethodName}`);
  }
  return service;
}

module.exports = { get };
