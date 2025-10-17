package com.ra.base_spring_boot.services.impl;

import com.ra.base_spring_boot.exception.PaymentException;
import com.ra.base_spring_boot.services.IPaymentGatewayRegistry;
import com.ra.base_spring_boot.services.IPaymentGatewayService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class PaymentGatewayRegistryImpl implements IPaymentGatewayRegistry {
    private static final Logger logger = LoggerFactory.getLogger(PaymentGatewayRegistryImpl.class);
    private final Map<String, IPaymentGatewayService> paymentGatewayServices = new HashMap<>();
    private final List<IPaymentGatewayService> services;

    @PostConstruct
    public void init() {
        for (IPaymentGatewayService service : services) {
            String methodName = service.getPaymentMethodName().toUpperCase();
            paymentGatewayServices.put(methodName, service);
            logger.info("Registered payment gateway service: {}", methodName);
        }
    }

    @Override
    public IPaymentGatewayService getPaymentGatewayService(String paymentMethodName) {
        if (paymentMethodName == null) {
            throw new PaymentException("Payment method name cannot be null");
        }
        IPaymentGatewayService service = paymentGatewayServices.get(paymentMethodName.toUpperCase());
        if (service == null) {
            logger.error("No payment gateway service found for method: {}", paymentMethodName);
            throw new PaymentException("Unsupported payment method: " + paymentMethodName);
        }
        return service;
    }
}