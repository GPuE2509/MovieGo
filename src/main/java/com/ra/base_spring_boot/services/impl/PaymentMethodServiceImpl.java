package com.ra.base_spring_boot.services.impl;

import com.ra.base_spring_boot.dto.req.FormPaymentMethod;
import com.ra.base_spring_boot.dto.resp.PaymentMethodResponse;
import com.ra.base_spring_boot.exception.PaymentException;
import com.ra.base_spring_boot.model.PaymentMethod;
import com.ra.base_spring_boot.repository.IPaymentMethodRepository;
import com.ra.base_spring_boot.services.IPaymentMethodService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentMethodServiceImpl implements IPaymentMethodService {
    private static final Logger logger = LoggerFactory.getLogger(PaymentMethodServiceImpl.class);
    private final IPaymentMethodRepository paymentMethodRepository;

    @Override
    @Transactional(readOnly = true)
    public List<PaymentMethodResponse> getAllPaymentMethods() {
        logger.info("Fetching all payment methods");
        return paymentMethodRepository.findAll().stream()
                .map(paymentMethod -> PaymentMethodResponse.builder()
                        .id(paymentMethod.getId())
                        .name(paymentMethod.getName())
                        .createdAt(paymentMethod.getCreatedAt())
                        .updatedAt(paymentMethod.getUpdatedAt())
                        .build())
                .toList();
    }

    @Override
    @Transactional
    public void createPaymentMethod(@Valid FormPaymentMethod formPaymentMethod) {
        logger.info("Creating payment method: {}", formPaymentMethod.getName());
        if (paymentMethodRepository.findByName(formPaymentMethod.getName()).isPresent()) {
            logger.warn("Payment method already exists: {}", formPaymentMethod.getName());
            throw new PaymentException("Payment method already exists: " + formPaymentMethod.getName());
        }

        PaymentMethod paymentMethod = PaymentMethod.builder()
                .name(formPaymentMethod.getName())
                .createdAt(new Date())
                .build();
        paymentMethodRepository.save(paymentMethod);
        logger.info("Payment method created successfully: {}", formPaymentMethod.getName());
    }

    @Override
    @Transactional
    public void deletePaymentMethod(String methodName) {
        logger.info("Deleting payment method: {}", methodName);
        PaymentMethod paymentMethod = paymentMethodRepository.findByName(methodName)
                .orElseThrow(() -> {
                    logger.error("Payment method not found: {}", methodName);
                    return new PaymentException("Payment method not found: " + methodName);
                });
        paymentMethodRepository.delete(paymentMethod);
        logger.info("Payment method deleted successfully: {}", methodName);
    }
}