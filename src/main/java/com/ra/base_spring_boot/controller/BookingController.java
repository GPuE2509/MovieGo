package com.ra.base_spring_boot.controller;

import com.ra.base_spring_boot.dto.ResponseWrapper;
import com.ra.base_spring_boot.dto.req.FormApplyCoupon;
import com.ra.base_spring_boot.dto.req.FormBooking;
import com.ra.base_spring_boot.dto.resp.BookingHistoryResponse;
import com.ra.base_spring_boot.dto.resp.BookingResponse;
import com.ra.base_spring_boot.dto.resp.CouponApplyResponse;
import com.ra.base_spring_boot.dto.resp.HistoryAwardResponse;
import com.ra.base_spring_boot.services.IBookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/user/bookings")
@RequiredArgsConstructor
@Tag(name = "User Booking", description = "APIs for user booking operations")
public class BookingController {

    @Autowired
    private IBookingService bookingService;

    @Operation(summary = "Create a new booking", description = "Create a booking for the authenticated user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Booking created successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input data")
    })
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> createBooking(@RequestBody FormBooking request, HttpServletRequest httpRequest) {
        try {
            Long userId = getCurrentUserId();
            BookingResponse response = bookingService.createBooking(userId, request, httpRequest);
            return ResponseEntity.status(HttpStatus.CREATED).body(
                    ResponseWrapper.builder()
                            .status(HttpStatus.CREATED)
                            .code(201)
                            .data(response)
                            .build()
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                    ResponseWrapper.builder()
                            .status(HttpStatus.BAD_REQUEST)
                            .code(400)
                            .data("Booking creation failed: " + e.getMessage())
                            .build()
            );
        }
    }
    @Operation(summary = "Apply a coupon to a booking", description = "Apply a coupon to an existing booking")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Coupon applied successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class))),
            @ApiResponse(responseCode = "400", description = "Invalid coupon or booking"),
            @ApiResponse(responseCode = "403", description = "Unauthorized access")
    })
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping("/apply-coupon/{bookingId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> applyCoupon(@PathVariable Long bookingId, @RequestBody FormApplyCoupon request) {
        try {
            Long userId = getCurrentUserId();
            CouponApplyResponse response = bookingService.applyCouponToBooking(userId, bookingId, request.getCouponCode());
            return ResponseEntity.ok().body(
                    ResponseWrapper.builder()
                            .status(HttpStatus.OK)
                            .code(200)
                            .data(response)
                            .build()
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                    ResponseWrapper.builder()
                            .status(HttpStatus.BAD_REQUEST)
                            .code(400)
                            .data("Failed to apply coupon: " + e.getMessage())
                            .build()
            );
        }
    }
    @Operation(summary = "Get all history award by user ID", description = "Retrieve all history award")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "All history award retrieved successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class))),
            @ApiResponse(responseCode = "400", description = "Invalid user ID"),
            @ApiResponse(responseCode = "403", description = "Unauthorized access")
    })
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/getAllHistoryAward")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getAllHistoryAward() {
        try {
            Long userId = getCurrentUserId();
            List<HistoryAwardResponse> response = bookingService.getAllHistoryAwards(userId);
            return ResponseEntity.ok().body(
                    ResponseWrapper.builder()
                            .status(HttpStatus.OK)
                            .code(200)
                            .data(response)
                            .build()
            );
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                    ResponseWrapper.builder()
                            .status(HttpStatus.FORBIDDEN)
                            .code(403)
                            .data("Unauthorized access: " + e.getMessage())
                            .build()
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    ResponseWrapper.builder()
                            .status(HttpStatus.BAD_REQUEST)
                            .code(400)
                            .data("Failed to retrieve booking: " + e.getMessage())
                            .build()
            );
        }
    }
    @Operation(summary = "Get booking by ID", description = "Retrieve details of a specific booking including booked seats")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Booking retrieved successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class))),
            @ApiResponse(responseCode = "400", description = "Invalid booking ID"),
            @ApiResponse(responseCode = "403", description = "Unauthorized access")
    })
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getBookingById(@PathVariable Long id) {
        try {
            Long userId = getCurrentUserId();
            BookingResponse response = bookingService.getBookingById(id, userId);
            return ResponseEntity.ok().body(
                    ResponseWrapper.builder()
                            .status(HttpStatus.OK)
                            .code(200)
                            .data(response)
                            .build()
            );
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                    ResponseWrapper.builder()
                            .status(HttpStatus.FORBIDDEN)
                            .code(403)
                            .data("Unauthorized access: " + e.getMessage())
                            .build()
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    ResponseWrapper.builder()
                            .status(HttpStatus.BAD_REQUEST)
                            .code(400)
                            .data("Failed to retrieve booking: " + e.getMessage())
                            .build()
            );
        }
    }

    @Operation(summary = "Get all bookings for user", description = "Retrieve all bookings for the authenticated user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Bookings retrieved successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class))),
            @ApiResponse(responseCode = "400", description = "Failed to retrieve bookings"),
            @ApiResponse(responseCode = "403", description = "Unauthorized access")
    })
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/my-bookings")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getMyBookings() {
        try {
            Long userId = getCurrentUserId();
            List<BookingHistoryResponse> responses = bookingService.getBookingsByUserId(userId);
            return ResponseEntity.ok().body(
                    ResponseWrapper.builder()
                            .status(HttpStatus.OK)
                            .code(200)
                            .data(responses)
                            .build()
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    ResponseWrapper.builder()
                            .status(HttpStatus.BAD_REQUEST)
                            .code(400)
                            .data("Failed to retrieve bookings: " + e.getMessage())
                            .build()
            );
        }
    }

    @Operation(summary = "Reserve seats for a showtime", description = "Reserve seats for a specific showtime without payment")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Seats reserved successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input data"),
            @ApiResponse(responseCode = "403", description = "Unauthorized access")
    })
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping("/reserve/{showtimeId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> reserveSeats(
            @PathVariable Long showtimeId,
            @RequestBody FormBooking request,
            HttpServletRequest httpRequest) {
        try {
            BookingResponse response = bookingService.reserveSeats(showtimeId, request.getSeatIds(), httpRequest);
            return ResponseEntity.ok().body(
                    ResponseWrapper.builder()
                            .status(HttpStatus.OK)
                            .code(200)
                            .data(response)
                            .build()
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                    ResponseWrapper.builder()
                            .status(HttpStatus.BAD_REQUEST)
                            .code(400)
                            .data("Seat reservation failed: " + e.getMessage())
                            .build()
            );
        }
    }


    @Operation(summary = "Create a payment for a booking", description = "Initiate payment for an existing booking")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Payment initiated successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input data"),
            @ApiResponse(responseCode = "403", description = "Unauthorized access")
    })
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping("/pay/{bookingId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> createPayment(
            @PathVariable Long bookingId,
            @RequestBody FormBooking request,
            HttpServletRequest httpRequest) {
        try {
            Long userId = getCurrentUserId();
            BookingResponse response = bookingService.createPayment(bookingId, userId, request.getPaymentMethodId(), httpRequest);
            return ResponseEntity.status(HttpStatus.CREATED).body(
                    ResponseWrapper.builder()
                            .status(HttpStatus.CREATED)
                            .code(201)
                            .data(response)
                            .build()
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                    ResponseWrapper.builder()
                            .status(HttpStatus.BAD_REQUEST)
                            .code(400)
                            .data("Payment creation failed: " + e.getMessage())
                            .build()
            );
        }
    }

    private Long getCurrentUserId() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return bookingService.getUserIdByUsername(username);
    }
}