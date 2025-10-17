package com.ra.base_spring_boot.services;

import java.util.Date;
import java.util.List;

public interface IEmailService {
    void sendEmail(String to, String subject, String otpCode, String verifyLink);
    void sendPaymentConfirmationEmail(String to, String subject, String transactionId, double amount,
                                      Date paymentTime, String movieTitle, List<String> seatNames,
                                      Date showtime, String paymentMethod, String theaterName, String screenName);
}