package com.ra.base_spring_boot.controller;

import com.ra.base_spring_boot.dto.ResponseWrapper;
import com.ra.base_spring_boot.dto.req.FormCoupon;
import com.ra.base_spring_boot.dto.resp.CouponResponse;
import com.ra.base_spring_boot.dto.resp.PageResponse;
import com.ra.base_spring_boot.services.ICouponService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Coupon Feature", description = "APIs for feature coupon (Admin and User)")
public class CouponController {
    @Autowired
    private final ICouponService couponService;

    @PreAuthorize("hasAuthority('ROLE_USER')")
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/user/available-coupons/{userId}")
    public ResponseEntity<List<CouponResponse>> getAvailableCoupons(@PathVariable Long userId) {
        List<CouponResponse> coupons = couponService.getAvailableCouponsForUser(userId);
        return ResponseEntity.ok(coupons);
    }

    @PreAuthorize("hasAuthority('ROLE_USER')")
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/user/my-coupons/{userId}")
    public ResponseEntity<List<CouponResponse>> getMyCoupons(@PathVariable Long userId) {
        List<CouponResponse> coupons = couponService.getUserCoupons(userId);
        return ResponseEntity.ok(coupons);
    }

    @PreAuthorize("hasAuthority('ROLE_USER')")
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping("/user/exchange/{couponId}/{userId}")
    public ResponseEntity<String> exchangeCoupon(@PathVariable Long couponId, @PathVariable Long userId) {
        couponService.exchangeCoupon(userId, couponId);
        return ResponseEntity.ok("Coupon exchanged successfully!");
    }

    @PreAuthorize("hasAuthority('ROLE_USER')")
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/user/can-exchange/{couponId}/{userId}")
    public ResponseEntity<Boolean> canExchangeCoupon(@PathVariable Long couponId, @PathVariable Long userId) {
        boolean canExchange = couponService.canExchangeCoupon(userId, couponId);
        return ResponseEntity.ok(canExchange);
    }

    @Operation(summary = "Get all coupons", description = "Retrieve a paginated list of coupons with optional search")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successful retrieval",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class))),
            @ApiResponse(responseCode = "400", description = "Invalid pagination parameters"),
    })
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/admin/coupons")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> getAllCoupons(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(defaultValue = "name") String sortField,
            @RequestParam(defaultValue = "asc") String sortOrder,
            @RequestParam(defaultValue = "") String search) {
        PageResponse<CouponResponse> couponResponse = couponService.getAllCoupons(page, pageSize, sortField, sortOrder, search);
        return ResponseEntity.status(HttpStatus.OK).body(
                ResponseWrapper.builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data(couponResponse)
                        .build()
        );
    }

    @Operation(summary = "Add a new coupon", description = "Create a new coupon")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Coupon created successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input data"),
            @ApiResponse(responseCode = "403", description = "Unauthorized access")
    })
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping("/admin/coupon/create")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> addCoupon(@Valid @RequestBody FormCoupon formCoupon) {
        couponService.createCoupon(formCoupon);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ResponseWrapper.builder()
                        .status(HttpStatus.CREATED)
                        .code(201)
                        .data("Coupon created successfully")
                        .build()
        );
    }

    @Operation(summary = "Update a coupon", description = "Update an existing coupon by ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Coupon updated successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input data"),
            @ApiResponse(responseCode = "403", description = "Unauthorized access"),
            @ApiResponse(responseCode = "404", description = "Coupon not found")
    })
    @SecurityRequirement(name = "bearerAuth")
    @PutMapping("/admin/coupon/update/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> updateCoupon(@Valid @PathVariable Long id, @RequestBody FormCoupon formCoupon) {
        couponService.updateCoupon(id, formCoupon);
        return ResponseEntity.ok().body(
                ResponseWrapper.builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data("Coupon updated successfully")
                        .build()
        );
    }

    @Operation(summary = "Delete a coupon", description = "Delete a coupon by ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Coupon deleted successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class))),
            @ApiResponse(responseCode = "404", description = "Coupon not found"),
            @ApiResponse(responseCode = "403", description = "Unauthorized access")
    })
    @SecurityRequirement(name = "bearerAuth")
    @DeleteMapping("/admin/coupon/delete/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> deleteCoupon(@Valid @PathVariable Long id) {
        couponService.deleteCoupon(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).body(
                ResponseWrapper.builder()
                        .status(HttpStatus.NO_CONTENT)
                        .code(204)
                        .data("Coupon deleted successfully")
                        .build()
        );
    }
}
