// Payment Gateway Configuration
const paymentConfig = {
  // VNPay Configuration
  vnpay: {
    tmnCode: process.env.VNPAY_TMN_CODE,
    hashSecret: process.env.VNPAY_HASH_SECRET,
    payUrl: process.env.VNPAY_PAY_URL,
    returnUrl: process.env.VNPAY_RETURN_URL,
    ipnUrl: process.env.VNPAY_IPN_URL,
  },

  // PayPal Configuration
  paypal: {
    mode: process.env.PAYPAL_MODE,
    clientId: process.env.PAYPAL_CLIENT_ID,
    clientSecret: process.env.PAYPAL_CLIENT_SECRET,
    returnUrl: process.env.PAYPAL_RETURN_URL,
    cancelUrl: process.env.PAYPAL_CANCEL_URL,
  },

  // MoMo Configuration
  momo: {
    partnerCode: process.env.MOMO_PARTNER_CODE,
    accessKey: process.env.MOMO_ACCESS_KEY,
    secretKey: process.env.MOMO_SECRET_KEY,
    payUrl: process.env.MOMO_PAY_URL,
    returnUrl: process.env.MOMO_RETURN_URL,
    ipnUrl: process.env.MOMO_IPN_URL,
  },

  // Exchange Rate API
  exchangeRate: {
    apiUrl: process.env.EXCHANGE_RATE_API_URL,
    apiKey: process.env.EXCHANGE_RATE_API_KEY
  }
};

module.exports = paymentConfig;
