package com.ra.base_spring_boot.services;

public interface IPaymentGatewayRegistry {
    IPaymentGatewayService getPaymentGatewayService(String paymentMethodName);
}
