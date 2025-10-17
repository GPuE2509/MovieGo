package com.ra.base_spring_boot.services.impl;

import com.ra.base_spring_boot.config.VnpayConfig;
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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VNPayPaymentServiceImpl implements IPaymentGatewayService {
    private static final Logger logger = LoggerFactory.getLogger(VNPayPaymentServiceImpl.class);
    private final VnpayConfig vnpayConfig;
    private final IPaymentRepository paymentRepository;
    private final PaymentStatusSyncServiceImpl paymentStatusSyncService;
    private final IEmailService emailService;

    @Override
    public String createPaymentUrl(Booking booking, String transactionId, HttpServletRequest request) throws Exception {
        logger.info("Creating VNPay payment URL for booking ID: {}, transaction ID: {}", booking.getId(), transactionId);
        Map<String, String> vnpParams = new TreeMap<>();
        vnpParams.put("vnp_Version", "2.1.0");
        vnpParams.put("vnp_Command", "pay");
        vnpParams.put("vnp_TmnCode", vnpayConfig.vnpTmnCode);
        vnpParams.put("vnp_Amount", String.valueOf((long) (booking.getTotalPriceMovie() * 100)));
        vnpParams.put("vnp_CurrCode", "VND");
        vnpParams.put("vnp_TxnRef", transactionId);
        vnpParams.put("vnp_OrderInfo", "Thanh toan don hang: " + booking.getId());
        vnpParams.put("vnp_OrderType", "other");
        vnpParams.put("vnp_Locale", "vn");
        vnpParams.put("vnp_ReturnUrl", vnpayConfig.vnpReturnUrl);
        vnpParams.put("vnp_IpAddr", VnpayConfig.getIpAddress(request));
        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMddHHmmss");
        sdf.setTimeZone(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));

        vnpParams.put("vnp_CreateDate", sdf.format(new Date()));
        vnpParams.put("vnp_ExpireDate", sdf.format(new Date(System.currentTimeMillis() + 15 * 60 * 1000)));

        StringBuilder query = new StringBuilder();
        for (Map.Entry<String, String> entry : vnpParams.entrySet()) {
            if (entry.getValue() != null && !entry.getValue().isEmpty()) {
                query.append(URLEncoder.encode(entry.getKey(), StandardCharsets.UTF_8))
                        .append("=")
                        .append(URLEncoder.encode(entry.getValue(), StandardCharsets.UTF_8))
                        .append("&");
            }
        }
        String queryString = query.toString();
        if (queryString.endsWith("&")) {
            queryString = queryString.substring(0, queryString.length() - 1);
        }
        String secureHash = HMACUtil.HMacHexStringEncode(HMACUtil.HMACSHA512, vnpayConfig.vnpHashSecret, queryString);
        if (secureHash == null) {
            logger.error("Failed to generate VNPay secure hash for transaction ID: {}", transactionId);
            throw new PaymentException("Failed to generate VNPay secure hash");
        }
        queryString += "&vnp_SecureHash=" + secureHash;

        String paymentUrl = vnpayConfig.vnpPayUrl + "?" + queryString;
        logger.info("Generated VNPay payment URL: {}", paymentUrl);
        return paymentUrl;
    }

    @Override
    public PaymentStatus handleCallback(Map<String, String> params) throws Exception {
        logger.info("Handling VNPay callback for transaction ID: {}", params.get("vnp_TxnRef"));
        String secureHash = params.get("vnp_SecureHash");
        if (secureHash == null) {
            logger.error("Missing VNPay secure hash in callback parameters");
            throw new PaymentException("Missing VNPay secure hash");
        }

        Map<String, String> sortedParams = new TreeMap<>(params);
        sortedParams.remove("vnp_SecureHash");
        StringBuilder query = new StringBuilder();
        for (Map.Entry<String, String> entry : sortedParams.entrySet()) {
            if (entry.getValue() != null && !entry.getValue().isEmpty()) {
                query.append(URLEncoder.encode(entry.getKey(), StandardCharsets.UTF_8))
                        .append("=")
                        .append(URLEncoder.encode(entry.getValue(), StandardCharsets.UTF_8))
                        .append("&");
            }
        }
        String queryString = query.toString();
        if (queryString.endsWith("&")) {
            queryString = queryString.substring(0, queryString.length() - 1);
        }

        String calculatedHash = HMACUtil.HMacHexStringEncode(HMACUtil.HMACSHA512, vnpayConfig.vnpHashSecret, queryString);
        if (calculatedHash == null) {
            logger.error("Failed to verify VNPay secure hash for transaction ID: {}", params.get("vnp_TxnRef"));
            throw new PaymentException("Failed to verify VNPay secure hash");
        }
        if (!secureHash.equals(calculatedHash)) {
            logger.error("Invalid VNPay secure hash for transaction ID: {}", params.get("vnp_TxnRef"));
            throw new PaymentException("Invalid VNPay secure hash");
        }

        String transactionId = params.get("vnp_TxnRef");
        String responseCode = params.get("vnp_ResponseCode");
        Payment payment = paymentRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> {
                    logger.error("Payment not found for VNPay transaction ID: {}", transactionId);
                    return new PaymentException("Payment not found for transaction ID: " + transactionId);
                });

        PaymentStatus paymentStatus;
        if ("00".equals(responseCode)) {
            payment.setPaymentStatus(PaymentStatus.COMPLETED);
            payment.setPaymentTime(new Date());
            logger.info("VNPay payment completed for transaction ID: {}", transactionId);
            // Send payment confirmation email only when successful
            String userEmail = payment.getBooking().getUser().getEmail();
            String movieTitle = payment.getBooking().getShowtime().getMovie().getTitle();
            logger.debug("Movie title for transaction ID {}: {}", transactionId, movieTitle);
            if (movieTitle == null || movieTitle.trim().isEmpty()) {
                logger.warn("Movie title is null or empty for transaction ID: {}", transactionId);
                movieTitle = "N/A";
            }
            String theaterName = payment.getBooking().getShowtime().getScreen().getTheater().getName();
            String screenName = payment.getBooking().getShowtime().getScreen().getName();
            if (theaterName == null || theaterName.trim().isEmpty()) {
                logger.warn("Theater name is null or empty for transaction ID: {}", transactionId);
                theaterName = "N/A";
            }
            if (screenName == null || screenName.trim().isEmpty()) {
                logger.warn("Screen name is null or empty for transaction ID: {}", transactionId);
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
        } else {
            payment.setPaymentStatus(PaymentStatus.FAILED);
            logger.warn("VNPay payment failed for transaction ID: {}, response code: {}", transactionId, responseCode);
            paymentStatus = PaymentStatus.FAILED;
        }
        paymentRepository.save(payment);
        paymentStatusSyncService.syncBookingStatusWithPayment(payment.getBooking().getId());
        return paymentStatus;
    }

    @Override
    public String getPaymentMethodName() {
        return "VNPAY";
    }
}