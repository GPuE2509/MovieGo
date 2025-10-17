package com.ra.base_spring_boot.repository;

import com.ra.base_spring_boot.model.Payment;
import com.ra.base_spring_boot.model.constants.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface IPaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByTransactionId(String transactionId);
    Optional<Payment> findByBookingId(Long bookingId);
    List<Payment> findByPaymentStatus(PaymentStatus paymentStatus);
}
