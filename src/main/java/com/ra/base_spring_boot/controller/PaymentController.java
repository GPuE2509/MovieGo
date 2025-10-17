package com.ra.base_spring_boot.controller;

import com.ra.base_spring_boot.dto.ResponseWrapper;
import com.ra.base_spring_boot.dto.req.FormPaymentMethod;
import com.ra.base_spring_boot.dto.resp.PaymentMethodResponse;
import com.ra.base_spring_boot.services.IPaymentMethodService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(("/api/v1"))
@RequiredArgsConstructor
@Tag(name = "Payment Management", description = "APIs for managing payments (Admin only)")
public class PaymentController {
    
    @Autowired
    private IPaymentMethodService paymentMethodService;

    @GetMapping("/admin/get-all-payment-method")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> getAllPaymentMethod() {
        List<PaymentMethodResponse> response = paymentMethodService.getAllPaymentMethods();
        return ResponseEntity.ok().body(
                ResponseWrapper.builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data(response)
                        .build()
        );
    }
    @PostMapping("/admin/add-payment-method")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> createPaymentMethod(@RequestBody FormPaymentMethod formPaymentMethod) {
        paymentMethodService.createPaymentMethod(formPaymentMethod);
        return ResponseEntity.ok().body(
                ResponseWrapper.builder()
                        .status(HttpStatus.CREATED)
                        .code(201)
                        .data("Payment Method created successfully")
                        .build()
        );
    }
    @DeleteMapping("/admin/delete-payment-method")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> deletePaymentMethod(@RequestBody FormPaymentMethod formPaymentMethod) {
        paymentMethodService.deletePaymentMethod(formPaymentMethod.getName());
        return ResponseEntity.ok().body(
                ResponseWrapper.builder()
                        .status(HttpStatus.NO_CONTENT)
                        .code(204)
                        .data("Payment Method deleted successfully")
                        .build()
        );
    }
}
