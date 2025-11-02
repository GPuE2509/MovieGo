const { VNPay, ignoreLogger, ProductCode, VnpLocale, dateFormat, verifySecureHash } = require("vnpay");

// Get VNPay instance (singleton pattern)
let vnpayInstance = null;

function getVNPayInstance() {
  if (!vnpayInstance) {
    const vnp_TmnCode = (process.env.VNP_TMN_CODE || "").trim();
    const vnp_HashSecret = (process.env.VNP_HASH_SECRET || "").trim();
    const vnp_PayUrl = (process.env.VNP_PAY_URL || "").trim();
    const vnp_ReturnUrl = (process.env.VNP_RETURN_URL || "").trim();

    if (!vnp_TmnCode || !vnp_HashSecret || !vnp_ReturnUrl) {
      throw new Error("VNPay configuration is missing. Please check VNP_TMN_CODE, VNP_HASH_SECRET, VNP_RETURN_URL");
    }

    // Extract payment host from pay URL or use default
    let paymentHost = "https://sandbox.vnpayment.vn";
    if (vnp_PayUrl) {
      try {
        const url = new URL(vnp_PayUrl);
        paymentHost = `${url.protocol}//${url.host}`;
      } catch (e) {
        // Keep default if URL parsing fails
      }
    }

    vnpayInstance = new VNPay({
      tmnCode: vnp_TmnCode,
      secureSecret: vnp_HashSecret,
      paymentHost: paymentHost,
      testMode: paymentHost.includes("sandbox") || paymentHost.includes("test"),
      hashAlgorithm: "SHA512",
      loggerFn: ignoreLogger,
    });
  }
  return vnpayInstance;
}

// Get client IP (match Java VnpayConfig.getIpAddress logic)
function getClientIp(req) {
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
  return clientIp;
}

async function createPaymentUrl(booking, transactionId, req) {
  const vnpay = getVNPayInstance();
  const vnp_ReturnUrl = (process.env.VNP_RETURN_URL || "").trim();

  // Calculate amount: total_price_movie * 100 (convert to cents)
  const amount = Math.round(Number(booking.total_price_movie || booking.totalPriceMovie || 0));

  // Get client IP
  const clientIp = getClientIp(req);

  // Calculate expire date (15 minutes from now)
  const expireDate = new Date(Date.now() + 15 * 60 * 1000);

  // Build payment URL using vnpay library
  // This library handles signature calculation automatically
  // buildPaymentUrl returns a string (payment URL) directly, not an object
  const paymentUrl = vnpay.buildPaymentUrl({
    vnp_Amount: amount,
    vnp_IpAddr: clientIp,
    vnp_TxnRef: transactionId,
    vnp_OrderInfo: `Thanh toan don hang: ${booking._id || booking.id}`,
    vnp_OrderType: ProductCode.Other,
    vnp_ReturnUrl: vnp_ReturnUrl,
    vnp_Locale: VnpLocale.VN,
    vnp_CreateDate: dateFormat(new Date()),
    vnp_ExpireDate: dateFormat(expireDate),
  });

  return paymentUrl;
}

async function handleCallback(params, rawQueryString = null) {
  // Verify signature manually
  // VNPay requires: hash should be calculated from RAW query string (as sent by VNPay, with original encoding)
  // If rawQueryString is provided, parse and rebuild from it (preserving encoding)
  // Otherwise, rebuild from decoded params (may not match VNPay's hash)
  const vnp_HashSecret = (process.env.VNP_HASH_SECRET || "").trim();
  if (!vnp_HashSecret) {
    throw new Error("VNP_HASH_SECRET is not configured");
  }

  const secureHash = params.vnp_SecureHash;
  if (!secureHash) {
    throw new Error("Missing VNPay secure hash");
  }

  let queryString;

  if (rawQueryString) {
    // Parse raw query string manually (preserving encoding like + and %3A)
    // URLSearchParams decodes automatically, so we parse manually
    const rawParams = {};
    const parts = rawQueryString.split('&');
    
    for (const part of parts) {
      const equalIndex = part.indexOf('=');
      if (equalIndex === -1) continue;
      
      const key = part.substring(0, equalIndex);
      const value = part.substring(equalIndex + 1);
      
      // Decode key only (to normalize), but keep value as-is (preserving encoding)
      const decodedKey = decodeURIComponent(key);
      
      if (decodedKey !== "vnp_SecureHash" && decodedKey !== "vnp_SecureHashType") {
        // Store with decoded key but raw value (preserving encoding)
        rawParams[decodedKey] = value; // Keep original encoding in value
      }
    }

    // Sort keys alphabetically and rebuild query string
    const sortedKeys = Object.keys(rawParams).sort();
    const queryParts = [];
    for (const key of sortedKeys) {
      const rawValue = rawParams[key];
      if (rawValue !== null && rawValue !== undefined && rawValue !== "") {
        // Use raw value (preserving encoding like + and %3A)
        // Note: key is decoded but we need to re-encode it, value stays raw
        queryParts.push(`${encodeURIComponent(key)}=${rawValue}`);
      }
    }
    queryString = queryParts.join("&");
  } else {
    // Fallback: rebuild from decoded params (may not match VNPay's hash)
    // Remove vnp_SecureHash and vnp_SecureHashType, then sort alphabetically
    const sortedParams = {};
    const keys = Object.keys(params).sort(); // Alphabetical order
    
    for (const key of keys) {
      if (key === "vnp_SecureHash" || key === "vnp_SecureHashType") {
        continue; // Skip these
      }
      const value = params[key];
      if (value !== null && value !== undefined && value !== "") {
        sortedParams[key] = value;
      }
    }

    // Build query string WITHOUT encoding (raw values)
    const queryParts = [];
    for (const key of Object.keys(sortedParams)) {
      const value = sortedParams[key];
      // NO encoding - use raw values for signature verification
      queryParts.push(`${key}=${String(value)}`);
    }
    queryString = queryParts.join("&");
  }

  // Calculate hash using HMAC SHA512 (match Java HMACUtil.HMacHexStringEncode)
  const crypto = require("crypto");
  const calculatedHash = crypto
    .createHmac("sha512", vnp_HashSecret)
    .update(queryString, "utf8")
    .digest("hex");

  // Compare hashes
  if (secureHash !== calculatedHash) {
    console.error("VNPay signature verification failed:", {
      transactionId: params.vnp_TxnRef,
      receivedHash: secureHash,
      calculatedHash: calculatedHash,
      queryString: queryString,
      params: Object.keys(params),
    });
    throw new Error("Invalid VNPay secure hash");
  }

  const transactionId = params.vnp_TxnRef;
  const responseCode = params.vnp_ResponseCode;
  const status = responseCode === "00" ? "COMPLETED" : "FAILED";
  return { transactionId, status };
}

module.exports = { createPaymentUrl, handleCallback, getPaymentMethodName: () => "VNPAY" };
