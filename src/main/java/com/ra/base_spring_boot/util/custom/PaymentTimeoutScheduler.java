package com.ra.base_spring_boot.util.custom;

import com.ra.base_spring_boot.model.Booking;
import com.ra.base_spring_boot.model.Payment;
import com.ra.base_spring_boot.model.constants.BookingStatus;
import com.ra.base_spring_boot.model.constants.PaymentStatus;
import com.ra.base_spring_boot.repository.IBookingRepository;
import com.ra.base_spring_boot.repository.IPaymentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Component
public class PaymentTimeoutScheduler {

    private static final Logger logger = LoggerFactory.getLogger(PaymentTimeoutScheduler.class);

    @Qualifier("taskScheduler")
    @Autowired
    private TaskScheduler taskScheduler;

    @Autowired
    private IPaymentRepository paymentRepository;

    @Autowired
    private IBookingRepository bookingRepository;

    private static final long PAYMENT_TIMEOUT_MINUTES = 10;

    public void schedulePaymentTimeout(Payment payment) {
        if (payment == null || payment.getId() == null || payment.getPaymentTime() == null) {
            logger.warn("Invalid payment provided for scheduling timeout");
            return;
        }
        Instant timeoutTime = payment.getPaymentTime().toInstant().plus(PAYMENT_TIMEOUT_MINUTES, ChronoUnit.MINUTES);
        taskScheduler.schedule(() -> checkAndCancelPayment(payment.getId()), timeoutTime);
        logger.info("Scheduled timeout task for payment ID: {} at {}", payment.getId(), timeoutTime);
    }

    @Transactional
    public void checkAndCancelPayment(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId).orElse(null);
        if (payment == null) {
            logger.warn("Payment ID: {} not found during timeout check", paymentId);
            return;
        }

        Booking booking = payment.getBooking();
        boolean updated = false;

        // Check and cancel Payment if it is still PENDING
        if (payment.getPaymentStatus() == PaymentStatus.PENDING) {
            logger.info("Cancelling payment {} due to timeout (transaction ID: {})", paymentId, payment.getTransactionId());
            payment.setPaymentStatus(PaymentStatus.CANCELLED);
            paymentRepository.save(payment);
            updated = true;
        }

        // Check and cancel Booking if it is still PENDING
        if (booking != null && booking.getStatus() == BookingStatus.PENDING) {
            logger.info("Cancelling booking associated with payment {} due to timeout", paymentId);
            booking.setStatus(BookingStatus.CANCELLED);
            bookingRepository.save(booking);
            updated = true;
        }

        if (!updated) {
            logger.info("No action taken for payment ID: {} - neither Payment nor Booking is PENDING", paymentId);
        }
    }
}