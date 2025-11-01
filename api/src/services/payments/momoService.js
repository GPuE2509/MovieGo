const https = require("https");
const crypto = require("crypto");

function hmacSHA256(secret, data) {
  return crypto.createHmac("sha256", secret).update(data, "utf8").digest("hex");
}

function postJson(url, body) {
  return new Promise((resolve, reject) => {
    const { hostname, pathname } = new URL(url);
    const data = JSON.stringify(body);
    const options = {
      hostname,
      path: pathname,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data),
      },
    };
    const req = https.request(options, (res) => {
      let chunks = "";
      res.on("data", (d) => (chunks += d));
      res.on("end", () => {
        try {
          const json = JSON.parse(chunks);
          resolve(json);
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

async function createPaymentUrl(booking, transactionId, req) {
  const partnerCode = process.env.MOMO_PARTNER_CODE;
  const accessKey = process.env.MOMO_ACCESS_KEY;
  const secretKey = process.env.MOMO_SECRET_KEY;
  const returnUrl = process.env.MOMO_RETURN_URL; // e.g. http://localhost:8080/api/v1/payments/momo/return
  const ipnUrl = process.env.MOMO_IPN_URL;       // e.g. http://localhost:8080/api/v1/payments/momo/ipn

  const orderId = transactionId;
  const requestId = transactionId;
  const amount = String(Math.round(Number(booking.total_price_movie)));
  const orderInfo = `Thanh toan don hang: ${booking._id}`;
  const requestType = "payWithMethod";
  const extraData = Buffer.from(JSON.stringify({ bookingId: String(booking._id) }), "utf8").toString("base64");

  const rawHash = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${returnUrl}&requestId=${requestId}&requestType=${requestType}`;
  const signature = hmacSHA256(secretKey, rawHash);

  const body = {
    partnerCode,
    accessKey,
    requestId,
    amount,
    orderId,
    orderInfo,
    redirectUrl: returnUrl,
    ipnUrl,
    requestType,
    payType: "webApp",
    extraData,
    signature,
    lang: "en",
  };

  const apiUrl = process.env.MOMO_CREATE_API || "https://test-payment.momo.vn/v2/gateway/api/create";
  const response = await postJson(apiUrl, body);
  if (response && response.payUrl) return response.payUrl;
  throw new Error(`Failed to create MoMo payment: ${JSON.stringify(response)}`);
}

async function handleCallback(params) {
  const accessKey = (process.env.MOMO_ACCESS_KEY || "").trim();
  const secretKey = (process.env.MOMO_SECRET_KEY || "").trim();
  
  if (!secretKey || !accessKey) {
    throw new Error("MoMo configuration is missing. Please check MOMO_ACCESS_KEY and MOMO_SECRET_KEY");
  }

  const signature = params.signature;
  if (!signature) {
    throw new Error("Missing MoMo signature in callback parameters");
  }

  // Build data string in alphabetical order as per Java BE
  // accessKey comes from config, NOT from params
  const dataParts = [];
  
  // Helper to append param if exists
  const appendParam = (name, value) => {
    if (value !== undefined && value !== null && value !== "") {
      if (dataParts.length > 0) dataParts.push("&");
      dataParts.push(`${name}=${value}`);
    }
  };

  // Build signature string in exact order as Java
  appendParam("accessKey", accessKey); // From config, not params!
  appendParam("amount", params.amount);
  appendParam("extraData", params.extraData);
  appendParam("message", params.message);
  appendParam("orderId", params.orderId);
  appendParam("orderInfo", params.orderInfo);
  appendParam("orderType", params.orderType);
  appendParam("partnerCode", params.partnerCode);
  appendParam("payType", params.payType);
  appendParam("requestId", params.requestId);
  appendParam("responseTime", params.responseTime);
  appendParam("resultCode", params.resultCode);
  appendParam("transId", params.transId);

  const dataString = dataParts.join("");
  const calculatedSignature = hmacSHA256(secretKey, dataString);

  if (signature !== calculatedSignature) {
    console.error("MoMo signature mismatch:", {
      received: signature,
      calculated: calculatedSignature,
      dataString: dataString,
      params: params
    });
    throw new Error("Invalid MoMo signature");
  }

  const orderId = params.orderId;
  let status = "FAILED";
  if (params.resultCode === "0") status = "COMPLETED";
  else if (["1003", "1017", "1000", "1002"].includes(String(params.resultCode))) status = "CANCELLED";
  
  return { transactionId: orderId, status };
}

module.exports = { createPaymentUrl, handleCallback, getPaymentMethodName: () => "MOMO" };
