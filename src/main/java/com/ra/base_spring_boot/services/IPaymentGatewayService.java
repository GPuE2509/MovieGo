package com.ra.base_spring_boot.services;

import com.ra.base_spring_boot.model.Booking;
import com.ra.base_spring_boot.model.constants.PaymentStatus;
import jakarta.servlet.http.HttpServletRequest;

import java.util.Map;

public interface IPaymentGatewayService {
    String createPaymentUrl(Booking booking, String transactionId, HttpServletRequest request) throws Exception;
    PaymentStatus handleCallback(Map<String, String> params) throws Exception;
    String getPaymentMethodName();
}
