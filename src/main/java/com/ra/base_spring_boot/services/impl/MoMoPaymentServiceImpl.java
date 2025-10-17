package com.ra.base_spring_boot.services.impl;

import com.ra.base_spring_boot.config.MoMoConfig;
import com.ra.base_spring_boot.exception.PaymentException;
import com.ra.base_spring_boot.model.Booking;
import com.ra.base_spring_boot.model.Payment;
import com.ra.base_spring_boot.model.constants.PaymentStatus;
import com.ra.base_spring_boot.repository.IPaymentRepository;
import com.ra.base_spring_boot.services.IEmailService;
import com.ra.base_spring_boot.services.IPaymentGatewayService;
import com.ra.base_spring_boot.util.crypto.HMACUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.cloudinary.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MoMoPaymentServiceImpl implements IPaymentGatewayService {
    private static final Logger logger = LoggerFactory.getLogger(MoMoPaymentServiceImpl.class);
    private final MoMoConfig moMoConfig;
    private final IPaymentRepository paymentRepository;
    private final PaymentStatusSyncServiceImpl paymentStatusSyncService;
    private final IEmailService emailService;

    @Override
    public String createPaymentUrl(Booking booking, String transactionId, HttpServletRequest request) throws Exception {
        logger.info("Creating MoMo payment URL for booking ID: {}, transaction ID: {}", booking.getId(), transactionId);

        String orderId = transactionId;
        String requestId = transactionId;
        String amount = String.valueOf((long) booking.getTotalPriceMovie());
        String orderInfo = "Thanh toan don hang: " + booking.getId();
        String extraData = Base64.getEncoder().encodeToString("{\"username\": \"momo\"}".getBytes(StandardCharsets.UTF_8));
        String requestType = "payWithMethod";

        // Generate raw signature
        String rawHash = String.format(
                "accessKey=%s&amount=%s&extraData=%s&ipnUrl=%s&orderId=%s&orderInfo=%s&partnerCode=%s&redirectUrl=%s&requestId=%s&requestType=%s",
                moMoConfig.accessKey, amount, extraData, moMoConfig.ipnUrl, orderId, orderInfo,
                moMoConfig.partnerCode, moMoConfig.returnUrl, requestId, requestType
        );

        // Calculate signature
        String signature = HMACUtil.HMacHexStringEncode(
                HMACUtil.HMACSHA256,           // algorithm
                moMoConfig.secretKey,          // secret key
                rawHash                        // data to be signed
        );
        if (signature == null) {
            logger.error("Failed to generate MoMo signature");
            throw new PaymentException("Failed to generate MoMo signature");
        }

        // Create request body JSON
        JSONObject requestBody = new JSONObject();
        requestBody.put("partnerCode", moMoConfig.partnerCode);
        requestBody.put("accessKey", moMoConfig.accessKey);
        requestBody.put("requestId", requestId);
        requestBody.put("amount", amount);
        requestBody.put("orderId", orderId);
        requestBody.put("orderInfo", orderInfo);
        requestBody.put("redirectUrl", moMoConfig.returnUrl);
        requestBody.put("ipnUrl", moMoConfig.ipnUrl);
        requestBody.put("requestType", requestType);
        requestBody.put("payType", "webApp");
        requestBody.put("extraData", extraData);
        requestBody.put("signature", signature);
        requestBody.put("lang", "en");

        // Call MoMo API
        CloseableHttpClient httpClient = HttpClients.createDefault();
        HttpPost httpPost = new HttpPost("https://test-payment.momo.vn/v2/gateway/api/create");
        httpPost.setHeader("Content-Type", "application/json");
        httpPost.setEntity(new StringEntity(requestBody.toString(), StandardCharsets.UTF_8));

        try (CloseableHttpResponse response = httpClient.execute(httpPost)) {
            BufferedReader reader = new BufferedReader(
                    new InputStreamReader(response.getEntity().getContent(), StandardCharsets.UTF_8));
            StringBuilder result = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                result.append(line);
            }

            JSONObject responseJson = new JSONObject(result.toString());
            logger.info("Response from MoMo: {}", result.toString());
            if (responseJson.has("payUrl")) {
                return responseJson.getString("payUrl");
            } else {
                logger.error("Failed to create MoMo payment: {}", responseJson);
                throw new PaymentException("Failed to create MoMo payment: " + responseJson);
            }
        }
    }

    @Override
    public PaymentStatus handleCallback(Map<String, String> params) throws Exception {
        logger.info("Handling MoMo callback for order ID: {}", params.get("orderId"));
        logger.info("Raw callback params: {}", params);

        String signature = params.get("signature");
        if (signature == null) {
            logger.error("Missing MoMo signature in callback parameters");
            throw new PaymentException("Missing MoMo signature");
        }

        // Build data string in alphabetical order
        StringBuilder dataString = new StringBuilder();
        appendParam(dataString, "accessKey", moMoConfig.accessKey);
        appendParam(dataString, "amount", params);
        appendParam(dataString, "extraData", params);
        appendParam(dataString, "message", params);
        appendParam(dataString, "orderId", params);
        appendParam(dataString, "orderInfo", params);
        appendParam(dataString, "orderType", params);
        appendParam(dataString, "partnerCode", params);
        appendParam(dataString, "payType", params);
        appendParam(dataString, "requestId", params);
        appendParam(dataString, "responseTime", params);
        appendParam(dataString, "resultCode", params);
        appendParam(dataString, "transId", params);

        logger.info("Data for signature calculation: {}", dataString);

        String calculatedSignature = HMACUtil.HMacHexStringEncode(
                HMACUtil.HMACSHA256,           // algorithm
                moMoConfig.secretKey,          // secret key
                dataString.toString()          // data to be signed
        );

        logger.info("Calculated signature: {}", calculatedSignature);
        logger.info("Received signature: {}", signature);

        if (!signature.equals(calculatedSignature)) {
            logger.error("Invalid MoMo signature for order ID: {}", params.get("orderId"));
            throw new PaymentException("Invalid MoMo signature");
        }

        String orderId = params.get("orderId");
        String resultCode = params.get("resultCode");
        Payment payment = paymentRepository.findByTransactionId(orderId)
                .orElseThrow(() -> {
                    logger.error("Payment not found for MoMo order ID: {}", orderId);
                    return new PaymentException("Payment not found for order ID: " + orderId);
                });

        PaymentStatus paymentStatus;
        if ("0".equals(resultCode)) {
            payment.setPaymentStatus(PaymentStatus.COMPLETED);
            payment.setPaymentTime(new Date());
            logger.info("MoMo payment completed for order ID: {}", orderId);
            // Send payment confirmation email only when successful
            String userEmail = payment.getBooking().getUser().getEmail();
            String movieTitle = payment.getBooking().getShowtime().getMovie().getTitle();
            logger.debug("Movie title for order ID {}: {}", orderId, movieTitle);
            if (movieTitle == null || movieTitle.trim().isEmpty()) {
                logger.warn("Movie title is null or empty for order ID: {}", orderId);
                movieTitle = "N/A";
            }
            String theaterName = payment.getBooking().getShowtime().getScreen().getTheater().getName();
            String screenName = payment.getBooking().getShowtime().getScreen().getName();
            if (theaterName == null || theaterName.trim().isEmpty()) {
                logger.warn("Theater name is null or empty for order ID: {}", orderId);
                theaterName = "N/A";
            }
            if (screenName == null || screenName.trim().isEmpty()) {
                logger.warn("Screen name is null or empty for order ID: {}", orderId);
                screenName = "N/A";
            }
            List<String> seatNames = payment.getBooking().getBookingSeats().stream()
                    .map(bookingSeat -> bookingSeat.getSeat().getSeatNumber())
                    .collect(Collectors.toList());
            Date showtime = payment.getBooking().getShowtime().getStartTime();
            emailService.sendPaymentConfirmationEmail(
                    userEmail,
                    "Payment Confirmation for Your Movie Ticket Booking",
                    payment.getTransactionId(),
                    payment.getAmount(),
                    payment.getPaymentTime(),
                    movieTitle,
                    seatNames,
                    showtime,
                    payment.getPaymentMethod().getName(),
                    theaterName,
                    screenName
            );
            paymentStatus = PaymentStatus.COMPLETED;
        } else if ("1003".equals(resultCode) || "1017".equals(resultCode) || "1000".equals(resultCode) || "1002".equals(resultCode)) {
            payment.setPaymentStatus(PaymentStatus.CANCELLED);
            logger.warn("MoMo payment cancelled for order ID: {}, result code: {}", orderId, resultCode);
            paymentStatus = PaymentStatus.CANCELLED;
        } else {
            payment.setPaymentStatus(PaymentStatus.FAILED);
            logger.error("MoMo payment failed for order ID: {}, result code: {}", orderId, resultCode);
            paymentStatus = PaymentStatus.FAILED;
        }
        paymentRepository.save(payment);
        paymentStatusSyncService.syncBookingStatusWithPayment(payment.getBooking().getId());
        return paymentStatus;
    }

    private void appendParam(StringBuilder builder, String paramName, String value) {
        if (value != null && !value.isEmpty()) {
            if (builder.length() > 0) {
                builder.append("&");
            }
            builder.append(paramName).append("=").append(value);
        }
    }

    private void appendParam(StringBuilder builder, String paramName, Map<String, String> params) {
        String value = params.get(paramName);
        if (value != null && !value.isEmpty()) {
            if (builder.length() > 0) {
                builder.append("&");
            }
            builder.append(paramName).append("=").append(value);
        }
    }

    @Override
    public String getPaymentMethodName() {
        return "MOMO";
    }
}