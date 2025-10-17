package com.ra.base_spring_boot.services.impl;

import com.paypal.api.payments.*;
import com.paypal.base.rest.APIContext;
import com.ra.base_spring_boot.exception.PaymentException;
import com.ra.base_spring_boot.model.Booking;
import com.ra.base_spring_boot.model.Payment;
import com.ra.base_spring_boot.model.constants.PaymentStatus;
import com.ra.base_spring_boot.repository.IPaymentRepository;
import com.ra.base_spring_boot.services.IEmailService;
import com.ra.base_spring_boot.services.IExchangeRateService;
import com.ra.base_spring_boot.services.IPaymentGatewayService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PayPalPaymentServiceImpl implements IPaymentGatewayService {

    private static final Logger logger = LoggerFactory.getLogger(PayPalPaymentServiceImpl.class);
    private static final String CURRENCY = "USD";

    private final APIContext apiContext;
    private final IPaymentRepository paymentRepository;
    private final PaymentStatusSyncServiceImpl paymentStatusSyncService; // Replace IBookingService
    private final IExchangeRateService exchangeRateService;
    @Autowired
    private final IEmailService emailService;
    @Override
    public String createPaymentUrl(Booking booking, String transactionId, HttpServletRequest request) throws Exception {
        logger.info("Creating PayPal payment URL for booking ID: {}, transaction ID: {}", booking.getId(), transactionId);

        double vndToUsdRate = exchangeRateService.getVndToUsdRate();

        Amount amount = new Amount();
        amount.setCurrency(CURRENCY);
        amount.setTotal(String.format("%.2f", booking.getTotalPriceMovie() * vndToUsdRate));

        exchangeRateService.clearVndToUsdRateCache();

        Transaction transaction = new Transaction();
        transaction.setDescription("Create order: " + booking.getId());
        transaction.setAmount(amount);
        transaction.setCustom(transactionId);

        List<Transaction> transactions = new ArrayList<>();
        transactions.add(transaction);

        Payer payer = new Payer();
        payer.setPaymentMethod("paypal");

        com.paypal.api.payments.Payment payment = new com.paypal.api.payments.Payment();
        payment.setIntent("sale");
        payment.setPayer(payer);
        payment.setTransactions(transactions);

        RedirectUrls redirectUrls = new RedirectUrls();
        redirectUrls.setReturnUrl(apiContext.getConfigurationMap().get("returnUrl"));
        redirectUrls.setCancelUrl(apiContext.getConfigurationMap().get("cancelUrl"));
        payment.setRedirectUrls(redirectUrls);

        try {
            com.paypal.api.payments.Payment createdPayment = payment.create(apiContext);
            for (Links link : createdPayment.getLinks()) {
                if ("approval_url".equals(link.getRel())) {
                    logger.info("Generated PayPal payment URL: {}", link.getHref());
                    Payment dbPayment = paymentRepository.findByBookingId(booking.getId())
                            .orElseThrow(() -> new PaymentException("Payment not found for booking ID: " + booking.getId()));
                    dbPayment.setTransactionId(transactionId);
                    paymentRepository.save(dbPayment);
                    return link.getHref();
                }
            }
            logger.error("No approval URL found in PayPal response for transaction ID: {}", transactionId);
            throw new PaymentException("No approval URL found in PayPal response");
        } catch (Exception e) {
            logger.error("Failed to create PayPal payment for transaction ID: {}: {}", transactionId, e.getMessage());
            throw new PaymentException("Failed to create PayPal payment: " + e.getMessage(), e);
        }
    }

    @Override
    public PaymentStatus handleCallback(Map<String, String> params) throws Exception {
        logger.info("Handling PayPal callback for payment ID: {}", params.get("paymentId"));

        String paymentId = params.get("paymentId");
        String payerId = params.get("PayerID");
        if (paymentId == null || payerId == null) {
            logger.error("Missing paymentId or PayerID in PayPal callback");
            throw new PaymentException("Missing paymentId or PayerID in PayPal callback");
        }

        try {
            com.paypal.api.payments.Payment payment = com.paypal.api.payments.Payment.get(apiContext, paymentId);
            logger.info("Initial payment state before execution: {}", payment.getState());

            PaymentExecution paymentExecution = new PaymentExecution();
            paymentExecution.setPayerId(payerId);

            com.paypal.api.payments.Payment executedPayment;
            try {
                executedPayment = payment.execute(apiContext, paymentExecution);
                logger.info("Payment executed successfully: {}", executedPayment.toJSON());
            } catch (com.paypal.base.rest.PayPalRESTException e) {
                logger.error("Payment execution failed: {}", e.getMessage());
                if (e.getDetails() != null && "PAYMENT_ALREADY_DONE".equals(e.getDetails().getName())) {
                    logger.warn("Payment already completed for payment ID: {}. Using existing state.", paymentId);
                    executedPayment = payment; // Reuse the original payment object
                } else {
                    throw e;
                }
            }

            String transactionId = executedPayment.getTransactions().get(0).getCustom();
            logger.info("Retrieved transaction ID from PayPal: {}", transactionId);

            Payment dbPayment = paymentRepository.findByTransactionId(transactionId)
                    .orElseThrow(() -> {
                        logger.error("Payment not found for PayPal transaction ID: {}", transactionId);
                        return new PaymentException("Payment not found for transaction ID: " + transactionId);
                    });
            logger.info("Database Payment transaction ID: {}", dbPayment.getTransactionId());

            String paymentState = executedPayment.getState();
            logger.info("PayPal payment state for transaction ID {}: {}", transactionId, paymentState);

            PaymentStatus paymentStatus;
            if ("completed".equalsIgnoreCase(paymentState) || "approved".equalsIgnoreCase(paymentState)) {
                dbPayment.setPaymentStatus(PaymentStatus.COMPLETED);
                dbPayment.setPaymentTime(new Date());
                logger.info("PayPal payment completed for transaction ID: {}", transactionId);
                // Send payment confirmation email only when successful
                String userEmail = dbPayment.getBooking().getUser().getEmail();
                String movieTitle = dbPayment.getBooking().getShowtime().getMovie().getTitle();
                logger.debug("Movie title for transaction ID {}: {}", transactionId, movieTitle);
                if (movieTitle == null || movieTitle.trim().isEmpty()) {
                    logger.warn("Movie title is null or empty for transaction ID: {}", transactionId);
                    movieTitle = "N/A";
                }
                String theaterName = dbPayment.getBooking().getShowtime().getScreen().getTheater().getName();
                String screenName = dbPayment.getBooking().getShowtime().getScreen().getName();
                if (theaterName == null || theaterName.trim().isEmpty()) {
                    logger.warn("Theater name is null or empty for transaction ID: {}", transactionId);
                    theaterName = "N/A";
                }
                if (screenName == null || screenName.trim().isEmpty()) {
                    logger.warn("Screen name is null or empty for transaction ID: {}", transactionId);
                    screenName = "N/A";
                }
                List<String> seatNames = dbPayment.getBooking().getBookingSeats().stream()
                        .map(bookingSeat -> bookingSeat.getSeat().getSeatNumber())
                        .collect(Collectors.toList());
                Date showtime = dbPayment.getBooking().getShowtime().getStartTime();
                emailService.sendPaymentConfirmationEmail(
                        userEmail,
                        "Payment Confirmation for Your Movie Ticket Booking",
                        dbPayment.getTransactionId(),
                        dbPayment.getAmount(),
                        dbPayment.getPaymentTime(),
                        movieTitle,
                        seatNames,
                        showtime,
                        dbPayment.getPaymentMethod().getName(),
                        theaterName,
                        screenName
                );
                paymentStatus = PaymentStatus.COMPLETED;
            } else {
                dbPayment.setPaymentStatus(PaymentStatus.FAILED);
                logger.warn("PayPal payment failed for transaction ID: {}. State: {}", transactionId, paymentState);
                paymentStatus = PaymentStatus.FAILED;
            }
            paymentRepository.save(dbPayment);
            paymentStatusSyncService.syncBookingStatusWithPayment(dbPayment.getBooking().getId());
            return paymentStatus;
        } catch (Exception e) {
            logger.error("Failed to execute PayPal payment for payment ID: {}: {}", paymentId, e.getMessage());
            throw new PaymentException("Failed to execute PayPal payment: " + e.getMessage(), e);
        }
    }

    @Override
    public String getPaymentMethodName() {
        return "PAYPAL";
    }
}