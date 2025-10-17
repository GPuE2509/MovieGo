// Payment Gateway Configuration
const paymentConfig = {
  // VNPay Configuration
  vnpay: {
    tmnCode: process.env.VNPAY_TMN_CODE,
    hashSecret: process.env.VNPAY_HASH_SECRET,
    payUrl: process.env.VNPAY_PAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
    returnUrl: process.env.VNPAY_RETURN_URL || 'http://localhost:3000/api/v1/payment/vnpay/return',
    ipnUrl: process.env.VNPAY_IPN_URL || 'http://localhost:3000/api/v1/payment/vnpay/ipn'
  },

  // PayPal Configuration
  paypal: {
    mode: process.env.PAYPAL_MODE || 'sandbox',
    clientId: process.env.PAYPAL_CLIENT_ID,
    clientSecret: process.env.PAYPAL_CLIENT_SECRET,
    returnUrl: process.env.PAYPAL_RETURN_URL || 'http://localhost:3000/api/v1/payment/paypal/return',
    cancelUrl: process.env.PAYPAL_CANCEL_URL || 'http://localhost:3000/api/v1/payment/paypal/cancel'
  },

  // MoMo Configuration
  momo: {
    partnerCode: process.env.MOMO_PARTNER_CODE,
    accessKey: process.env.MOMO_ACCESS_KEY,
    secretKey: process.env.MOMO_SECRET_KEY,
    payUrl: process.env.MOMO_PAY_URL || 'https://test-payment.momo.vn/v2/gateway/api/create',
    returnUrl: process.env.MOMO_RETURN_URL || 'http://localhost:3000/api/v1/payment/momo/return',
    ipnUrl: process.env.MOMO_IPN_URL || 'http://localhost:3000/api/v1/payment/momo/ipn'
  },

  // Exchange Rate API
  exchangeRate: {
    apiUrl: process.env.EXCHANGE_RATE_API_URL || 'https://api.exchangerate-api.com/v4/latest/USD',
    apiKey: process.env.EXCHANGE_RATE_API_KEY
  }
};

module.exports = paymentConfig;
