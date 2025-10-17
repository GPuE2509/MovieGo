package com.ra.base_spring_boot.services;

import com.ra.base_spring_boot.dto.req.FormPaymentMethod;
import com.ra.base_spring_boot.dto.resp.PaymentMethodResponse;

import java.util.List;

public interface IPaymentMethodService {
    List<PaymentMethodResponse> getAllPaymentMethods();
    void createPaymentMethod(FormPaymentMethod formPaymentMethod);
    void deletePaymentMethod(String methodName);
}
