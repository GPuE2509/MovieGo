// Payment Gateway Configuration
const paymentConfig = {
  // VNPay Configuration
  vnpay: {
    tmnCode: process.env.VNP_TMN_CODE,
    hashSecret: process.env.VNP_HASH_SECRET,
    payUrl: process.env.VNP_PAY_URL,
    returnUrl: process.env.VNP_RETURN_URL,
    ipnUrl: process.env.VNP_IPN_URL,
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
