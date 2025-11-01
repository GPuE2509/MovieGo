const crypto = require("crypto");

function hmacSHA512(secret, data) {
  if (!secret) {
    throw new Error("VNP_HASH_SECRET is not configured");
  }
  return crypto.createHmac("sha512", secret).update(data, "utf8").digest("hex");
}

function formatDateYmdHmsICT(date = new Date()) {
  // Format date in Asia/Ho_Chi_Minh timezone (UTC+7)
  // VNPay requires: yyyyMMddHHmmss format in ICT timezone
  // Convert UTC to ICT: add 7 hours
  const ictOffset = 7 * 60 * 60 * 1000;
  const ictTime = date.getTime() + ictOffset;
  const ictDate = new Date(ictTime);
  
  // Use UTC methods after offset adjustment
  const year = ictDate.getUTCFullYear();
  const month = String(ictDate.getUTCMonth() + 1).padStart(2, "0");
  const day = String(ictDate.getUTCDate()).padStart(2, "0");
  const hour = String(ictDate.getUTCHours()).padStart(2, "0");
  const minute = String(ictDate.getUTCMinutes()).padStart(2, "0");
  const second = String(ictDate.getUTCSeconds()).padStart(2, "0");
  
  return `${year}${month}${day}${hour}${minute}${second}`;
}

function buildQuery(params) {
  // Use TreeMap-like behavior: sort keys alphabetically
  const sortedKeys = Object.keys(params)
    .filter((k) => {
      const value = params[k];
      return value !== undefined && value !== null && value !== "";
    })
    .sort();
  
  const queryParts = [];
  for (const key of sortedKeys) {
    const encodedKey = encodeURIComponent(key);
    const encodedValue = encodeURIComponent(String(params[key]));
    queryParts.push(`${encodedKey}=${encodedValue}`);
  }
  
  return queryParts.join("&");
}

async function createPaymentUrl(booking, transactionId, req) {
  const vnp_TmnCode = (process.env.VNP_TMN_CODE || "").trim();
  const vnp_HashSecret = (process.env.VNP_HASH_SECRET || "").trim();
  const vnp_ReturnUrl = (process.env.VNP_RETURN_URL || "").trim();
  const vnp_PayUrl = (process.env.VNP_PAY_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html").trim();

  if (!vnp_TmnCode || !vnp_HashSecret || !vnp_ReturnUrl) {
    throw new Error("VNPay configuration is missing. Please check VNP_TMN_CODE, VNP_HASH_SECRET, VNP_RETURN_URL");
  }

  // Calculate amount: total_price_movie * 100 (convert to cents)
  const amount = Math.round(Number(booking.total_price_movie || booking.totalPriceMovie || 0) * 100);
  
  // Get client IP (match Java VnpayConfig.getIpAddress logic)
  let clientIp = "127.0.0.1";
  if (req) {
    const xForwardedFor = req.headers["x-forwarded-for"] || req.headers["X-FORWARDED-FOR"];
    if (xForwardedFor && xForwardedFor.trim()) {
      clientIp = xForwardedFor.split(",")[0].trim();
    } else {
      clientIp = req.connection?.remoteAddress || req.socket?.remoteAddress || req.ip || "127.0.0.1";
    }
    // Convert IPv6 loopback to standard format
    if (clientIp === "::1" || clientIp === "::ffff:127.0.0.1") {
      clientIp = "127.0.0.1";
    }
  }

  // Format dates in ICT timezone
  const createDate = formatDateYmdHmsICT(new Date());
  const expireDate = formatDateYmdHmsICT(new Date(Date.now() + 15 * 60 * 1000)); // +15 minutes

  // Build params - use Map-like structure that will be sorted
  const vnpParams = {};
  vnpParams["vnp_Version"] = "2.1.0";
  vnpParams["vnp_Command"] = "pay";
  vnpParams["vnp_TmnCode"] = vnp_TmnCode;
  vnpParams["vnp_Amount"] = String(amount);
  vnpParams["vnp_CurrCode"] = "VND";
  vnpParams["vnp_TxnRef"] = transactionId;
  vnpParams["vnp_OrderInfo"] = `Thanh toan don hang: ${booking._id || booking.id}`;
  vnpParams["vnp_OrderType"] = "other";
  vnpParams["vnp_Locale"] = "vn";
  vnpParams["vnp_ReturnUrl"] = vnp_ReturnUrl;
  vnpParams["vnp_IpAddr"] = clientIp;
  vnpParams["vnp_CreateDate"] = createDate;
  vnpParams["vnp_ExpireDate"] = expireDate;

  // Build query string (automatically sorted by buildQuery)
  const queryString = buildQuery(vnpParams);
  
  // Calculate HMAC SHA512 hash
  const vnp_SecureHash = hmacSHA512(vnp_HashSecret, queryString);
  
  // Append secure hash to query string
  const finalQueryString = `${queryString}&vnp_SecureHash=${vnp_SecureHash}`;
  
  // Build final payment URL
  const paymentUrl = `${vnp_PayUrl}?${finalQueryString}`;
  
  return paymentUrl;
}

async function handleCallback(params) {
  const vnp_HashSecret = process.env.VNP_HASH_SECRET;
  const secureHash = params.vnp_SecureHash;
  if (!secureHash) throw new Error("Missing VNPay secure hash");
  const cloned = { ...params };
  delete cloned.vnp_SecureHash;
  const query = buildQuery(cloned);
  const calculated = hmacSHA512(vnp_HashSecret, query);
  if (secureHash !== calculated) throw new Error("Invalid VNPay secure hash");

  const transactionId = params.vnp_TxnRef;
  const responseCode = params.vnp_ResponseCode;
  const status = responseCode === "00" ? "COMPLETED" : "FAILED";
  return { transactionId, status };
}

module.exports = { createPaymentUrl, handleCallback, getPaymentMethodName: () => "VNPAY" };
