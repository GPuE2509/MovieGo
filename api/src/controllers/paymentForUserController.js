const PaymentMethod = require('../models/paymentMethod');
const Payment = require('../models/payment');

const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL || 'http://localhost:3001/';

class PaymentForUserController {
  async getPaymentMethods(req, res) {
    try {
      const methods = await PaymentMethod.find({ is_active: true }).lean();
      return res.status(200).json({ success: true, data: methods });
    } catch (e) {
      return res.status(400).json({ success: false, message: `Failed to retrieve payment methods: ${e.message}` });
    }
  }

  async handleVNPayReturn(req, res) { return this.handleCallback('VNPAY', req, res); }
  async handleVNPayIPN(req, res) { return this.handleCallback('VNPAY', req, res); }
  async handleMoMoReturn(req, res) { return this.handleCallback('MOMO', req, res); }
  async handleMoMoIPN(req, res) { return this.handleCallback('MOMO', req, res); }

  async handleCallback(gateway, req, res) {
    try {
      const params = req.query || {};
      const { status, code, txId } = this.parseGatewayParams(gateway, params);

      if (!txId) {
        return this.redirectFailure(res, `${gateway} transaction id not found`);
      }

      const payment = await Payment.findOne({ transaction_id: txId });
      if (!payment) {
        return this.redirectFailure(res, `Payment not found for transaction ID: ${txId}`);
      }

      if (status === 'COMPLETED') {
        payment.payment_status = 'COMPLETED';
        payment.payment_time = new Date();
      } else if (status === 'FAILED') {
        payment.payment_status = 'FAILED';
      }
      payment.gateway_response = JSON.stringify(params).slice(0, 4000);
      await payment.save();

      return this.redirectSuccess(res, `${gateway} payment ${status.toLowerCase()}`);
    } catch (e) {
      return this.redirectFailure(res, `Failed to process ${gateway} callback: ${e.message}`);
    }
  }

  parseGatewayParams(gateway, params) {
    let status = 'FAILED';
    let code = 'UNKNOWN';
    let txId = null;

    if (gateway === 'VNPAY') {
      code = params.vnp_ResponseCode || params.code;
      status = code === '00' ? 'COMPLETED' : 'FAILED';
      txId = params.vnp_TxnRef || params.transactionId;
    } else if (gateway === 'MOMO') {
      const resultCode = params.resultCode != null ? Number(params.resultCode) : undefined;
      status = resultCode === 0 ? 'COMPLETED' : 'FAILED';
      txId = params.orderId || params.requestId || params.transactionId;
    }

    return { status, code, txId };
  }

  redirectSuccess(res, message) {
    const url = new URL(FRONTEND_BASE_URL + 'payment-success');
    url.searchParams.set('status', 'OK');
    url.searchParams.set('code', '200');
    url.searchParams.set('data', message);
    return res.redirect(303, url.toString());
  }

  redirectFailure(res, message) {
    const url = new URL(FRONTEND_BASE_URL + 'payment-failure');
    url.searchParams.set('status', 'BAD_REQUEST');
    url.searchParams.set('code', '400');
    url.searchParams.set('data', message);
    return res.redirect(303, url.toString());
  }
}

module.exports = new PaymentForUserController();


