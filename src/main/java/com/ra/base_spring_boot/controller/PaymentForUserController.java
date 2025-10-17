package com.ra.base_spring_boot.controller;

import com.ra.base_spring_boot.dto.ResponseWrapper;
import com.ra.base_spring_boot.dto.req.FormPaymentMethod;
import com.ra.base_spring_boot.dto.resp.PaymentMethodResponse;
import com.ra.base_spring_boot.exception.PaymentException;
import com.ra.base_spring_boot.model.Payment;
import com.ra.base_spring_boot.model.constants.PaymentStatus;
import com.ra.base_spring_boot.repository.IPaymentRepository;
import com.ra.base_spring_boot.services.IPaymentGatewayRegistry;
import com.ra.base_spring_boot.services.IPaymentGatewayService;
import com.ra.base_spring_boot.services.IPaymentMethodService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Tag(name = "Return Payment", description = "APIs for feature of Return after finish payment in different service")
public class PaymentForUserController {

    @Autowired
    private IPaymentGatewayRegistry paymentGatewayRegistry;

    @Autowired
    private IPaymentRepository paymentRepository;

    @Autowired
    private IPaymentMethodService paymentMethodService;

    @Value("${frontend.base.url}")
    private String frontendBaseUrl;

    private static final Logger logger = LoggerFactory.getLogger(PaymentForUserController.class);

    @Operation(summary = "Get all payment methods", description = "Retrieve all available payment methods")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Payment methods retrieved successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class))),
            @ApiResponse(responseCode = "400", description = "Failed to retrieve payment methods")
    })
    @GetMapping("/methods")
    public ResponseEntity<ResponseWrapper<?>> getPaymentMethods() {
        try {
            List<PaymentMethodResponse> methods = paymentMethodService.getAllPaymentMethods();
            logger.info("Retrieved {} payment methods", methods.size());
            return ResponseEntity.ok(ResponseWrapper.<List<PaymentMethodResponse>>builder()
                    .status(HttpStatus.OK)
                    .code(200)
                    .data(methods)
                    .build());
        } catch (Exception e) {
            logger.error("Failed to retrieve payment methods: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ResponseWrapper.builder()
                    .status(HttpStatus.BAD_REQUEST)
                    .code(400)
                    .data("Failed to retrieve payment methods: " + e.getMessage())
                    .build());
        }
    }

    @Operation(summary = "Create a payment method", description = "Create a new payment method (Admin only)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Payment method created successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input data"),
            @ApiResponse(responseCode = "403", description = "Unauthorized access")
    })
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping("/create/methods")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResponseWrapper<String>> createPaymentMethod(@Valid @RequestBody FormPaymentMethod formPaymentMethod) {
        try {
            paymentMethodService.createPaymentMethod(formPaymentMethod);
            logger.info("Payment method created: {}", formPaymentMethod.getName());
            return ResponseEntity.status(HttpStatus.CREATED).body(ResponseWrapper.<String>builder()
                    .status(HttpStatus.CREATED)
                    .code(201)
                    .data("Payment method created successfully")
                    .build());
        } catch (PaymentException e) {
            logger.error("Failed to create payment method: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ResponseWrapper.<String>builder()
                    .status(HttpStatus.BAD_REQUEST)
                    .code(400)
                    .data(e.getMessage())
                    .build());
        } catch (Exception e) {
            logger.error("Unexpected error creating payment method: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ResponseWrapper.<String>builder()
                    .status(HttpStatus.BAD_REQUEST)
                    .code(400)
                    .data("Failed to create payment method: " + e.getMessage())
                    .build());
        }
    }

    @Operation(summary = "Delete a payment method", description = "Delete a payment method by name (Admin only)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Payment method deleted successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class))),
            @ApiResponse(responseCode = "400", description = "Invalid payment method name"),
            @ApiResponse(responseCode = "403", description = "Unauthorized access")
    })
    @SecurityRequirement(name = "bearerAuth")
    @DeleteMapping("/methods/{methodName}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResponseWrapper<String>> deletePaymentMethod(@PathVariable String methodName) {
        try {
            paymentMethodService.deletePaymentMethod(methodName);
            logger.info("Payment method deleted: {}", methodName);
            return ResponseEntity.ok(ResponseWrapper.<String>builder()
                    .status(HttpStatus.OK)
                    .code(200)
                    .data("Payment method deleted successfully")
                    .build());
        } catch (PaymentException e) {
            logger.error("Failed to delete payment method: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ResponseWrapper.<String>builder()
                    .status(HttpStatus.BAD_REQUEST)
                    .code(400)
                    .data(e.getMessage())
                    .build());
        } catch (Exception e) {
            logger.error("Unexpected error deleting payment method: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ResponseWrapper.<String>builder()
                    .status(HttpStatus.BAD_REQUEST)
                    .code(400)
                    .data("Failed to delete payment method: " + e.getMessage())
                    .build());
        }
    }

    @Operation(summary = "Handle VNPay return callback", description = "Process VNPay payment return callback")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Callback processed successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class))),
            @ApiResponse(responseCode = "400", description = "Invalid callback parameters")
    })
    @GetMapping("/vnpay/return")
    public ResponseEntity<ResponseWrapper<String>> handleVNPayReturn(@RequestParam Map<String, String> params) {
        return handleCallback("VNPAY", params);
    }

    @Operation(summary = "Handle VNPay IPN callback", description = "Process VNPay IPN callback")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Callback processed successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class))),
            @ApiResponse(responseCode = "400", description = "Invalid callback parameters")
    })
    @GetMapping("/vnpay/ipn")
    public ResponseEntity<ResponseWrapper<String>> handleVNPayIPN(@RequestParam Map<String, String> params) {
        return handleCallback("VNPAY", params);
    }

    @Operation(summary = "Handle MoMo return callback", description = "Process MoMo payment return callback")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Callback processed successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class))),
            @ApiResponse(responseCode = "400", description = "Invalid callback parameters")
    })
    @GetMapping("/momo/return")
    public ResponseEntity<ResponseWrapper<String>> handleMoMoReturn(@RequestParam Map<String, String> params) {
        return handleCallback("MOMO", params);
    }

    @Operation(summary = "Handle MoMo IPN callback", description = "Process MoMo IPN callback")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Callback processed successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class))),
            @ApiResponse(responseCode = "400", description = "Invalid callback parameters")
    })
    @GetMapping("/momo/ipn")
    public ResponseEntity<ResponseWrapper<String>> handleMoMoIPN(@RequestParam Map<String, String> params) {
        return handleCallback("MOMO", params);
    }

    @Operation(summary = "Handle PayPal return callback", description = "Process PayPal payment return callback")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Callback processed successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class))),
            @ApiResponse(responseCode = "400", description = "Invalid callback parameters")
    })
    @GetMapping("/paypal/return")
    public ResponseEntity<ResponseWrapper<String>> handlePayPalReturn(@RequestParam Map<String, String> params) {
        return handleCallback("PAYPAL", params);
    }

    @Operation(summary = "Handle PayPal cancel callback", description = "Process PayPal payment cancellation")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Cancellation processed successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class))),
            @ApiResponse(responseCode = "400", description = "Invalid callback parameters")
    })
    @GetMapping("/paypal/cancel")
    public ResponseEntity<ResponseWrapper<String>> handlePayPalCancel(@RequestParam Map<String, String> params) {
        try {
            String transactionId = params.get("paymentId");
            String effectiveTransactionId = transactionId != null ? transactionId : params.get("token");
            if (effectiveTransactionId == null) {
                logger.error("Payment not found for PayPal transaction ID: null");
                return ResponseEntity.badRequest().body(ResponseWrapper.<String>builder()
                        .status(HttpStatus.BAD_REQUEST)
                        .code(400)
                        .data("Payment not found for transaction ID: null")
                        .build());
            }
            logger.info("Handling PayPal cancel for transaction ID: {}", effectiveTransactionId);
            Payment payment = paymentRepository.findByTransactionId(effectiveTransactionId)
                    .orElseThrow(() -> {
                        logger.error("Payment not found for PayPal transaction ID: {}", effectiveTransactionId);
                        return new PaymentException("Payment not found for transaction ID: " + effectiveTransactionId);
                    });
            payment.setPaymentStatus(PaymentStatus.CANCELLED);
            paymentRepository.save(payment);
            logger.info("PayPal payment cancelled for transaction ID: {}", effectiveTransactionId);
            return ResponseEntity.ok(ResponseWrapper.<String>builder()
                    .status(HttpStatus.OK)
                    .code(200)
                    .data("PayPal payment cancelled")
                    .build());
        } catch (PaymentException e) {
            logger.error("Failed to process PayPal cancellation: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ResponseWrapper.<String>builder()
                    .status(HttpStatus.BAD_REQUEST)
                    .code(400)
                    .data(e.getMessage())
                    .build());
        } catch (Exception e) {
            logger.error("Unexpected error processing PayPal cancellation: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ResponseWrapper.<String>builder()
                    .status(HttpStatus.BAD_REQUEST)
                    .code(400)
                    .data("Failed to process PayPal cancellation: " + e.getMessage())
                    .build());
        }
    }

    private ResponseEntity<ResponseWrapper<String>> handleCallback(String paymentMethodName, Map<String, String> params) {
        try {
            logger.info("Processing {} callback with params: {}", paymentMethodName, params);
            IPaymentGatewayService paymentService = paymentGatewayRegistry.getPaymentGatewayService(paymentMethodName);
            PaymentStatus paymentStatus = paymentService.handleCallback(params);
            logger.info("{} callback processed successfully with status: {}", paymentMethodName, paymentStatus);

            String redirectUrl;
            if (paymentStatus == PaymentStatus.COMPLETED) {
                // Redirect to success page
                redirectUrl = UriComponentsBuilder.fromUriString(frontendBaseUrl + "payment-success")
                        .queryParam("status", HttpStatus.OK.toString())
                        .queryParam("code", 200)
                        .queryParam("data", paymentMethodName + " payment completed successfully")
                        .build()
                        .toUriString();
            } else {
                // Redirect to failure page
                redirectUrl = UriComponentsBuilder.fromUriString(frontendBaseUrl + "payment-failure")
                        .queryParam("status", HttpStatus.BAD_REQUEST.toString())
                        .queryParam("code", 400)
                        .queryParam("data", paymentMethodName + " payment failed")
                        .build()
                        .toUriString();
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setLocation(UriComponentsBuilder.fromUriString(redirectUrl).build().toUri());
            return new ResponseEntity<>(headers, HttpStatus.SEE_OTHER); // 303 See Other for redirect

        } catch (PaymentException e) {
            logger.error("Failed to process {} callback: {}", paymentMethodName, e.getMessage());
            String redirectUrl = UriComponentsBuilder.fromUriString(frontendBaseUrl + "payment-failure")
                    .queryParam("status", HttpStatus.BAD_REQUEST.toString())
                    .queryParam("code", 400)
                    .queryParam("data", e.getMessage())
                    .build()
                    .toUriString();

            HttpHeaders headers = new HttpHeaders();
            headers.setLocation(UriComponentsBuilder.fromUriString(redirectUrl).build().toUri());
            return new ResponseEntity<>(headers, HttpStatus.SEE_OTHER);
        } catch (Exception e) {
            logger.error("Unexpected error processing {} callback: {}", paymentMethodName, e.getMessage());
            String redirectUrl = UriComponentsBuilder.fromUriString(frontendBaseUrl + "payment-failure")
                    .queryParam("status", HttpStatus.BAD_REQUEST.toString())
                    .queryParam("code", 400)
                    .queryParam("data", "Failed to process " + paymentMethodName + " callback: " + e.getMessage())
                    .build()
                    .toUriString();

            HttpHeaders headers = new HttpHeaders();
            headers.setLocation(UriComponentsBuilder.fromUriString(redirectUrl).build().toUri());
            return new ResponseEntity<>(headers, HttpStatus.SEE_OTHER);
        }
    }
}