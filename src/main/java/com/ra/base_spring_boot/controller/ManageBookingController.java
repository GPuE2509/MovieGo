package com.ra.base_spring_boot.controller;

import com.ra.base_spring_boot.dto.ResponseWrapper;
import com.ra.base_spring_boot.dto.resp.AdminBookingResponse;
import com.ra.base_spring_boot.model.constants.BookingStatus;
import com.ra.base_spring_boot.services.IBookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/bookings")
@RequiredArgsConstructor
@Tag(name = "Manage Booking", description = "APIs for admin booking management operations")
public class ManageBookingController {
    
    @Autowired
    private IBookingService bookingService;

    @Operation(summary = "Get all bookings", description = "Retrieve all bookings with search, sorting, and pagination (Admin only)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Bookings retrieved successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class))),
            @ApiResponse(responseCode = "400", description = "Invalid search or pagination parameters"),
            @ApiResponse(responseCode = "403", description = "Unauthorized access (Admin only)")
    })
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllBookings(
            @Parameter(description = "Search term for movie title or user email") @RequestParam(required = false) String search,
            @Parameter(description = "Page number, starting from 0") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort field, e.g., 'id' or 'createdAt'") @RequestParam(defaultValue = "id") String sortBy,
            @Parameter(description = "Sort direction, 'asc' or 'desc'") @RequestParam(defaultValue = "asc") String direction) {
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.fromString(direction), sortBy));
            Page<AdminBookingResponse> responses = bookingService.getAllBookings(search, pageable);
            return ResponseEntity.status(HttpStatus.OK).body(
                    ResponseWrapper.builder()
                            .status(HttpStatus.OK)
                            .code(200)
                            .data(responses)
                            .build()
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    ResponseWrapper.builder()
                            .status(HttpStatus.BAD_REQUEST)
                            .code(400)
                            .data("Failed to retrieve bookings: " + e.getMessage())
                            .build()
            );
        }
    }

    @Operation(summary = "Get booking details by ID", description = "Retrieve detailed booking information including booked seats (Admin only)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Booking details retrieved successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class))),
            @ApiResponse(responseCode = "400", description = "Invalid booking ID"),
            @ApiResponse(responseCode = "403", description = "Unauthorized access (Admin only)")
    })
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getBookingByIdAdmin(@PathVariable Long id) {
        try {
            AdminBookingResponse response = bookingService.getBookingByIdAdmin(id);
            return ResponseEntity.status(HttpStatus.OK).body(
                    ResponseWrapper.builder()
                            .status(HttpStatus.OK)
                            .code(200)
                            .data(response)
                            .build()
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    ResponseWrapper.builder()
                            .status(HttpStatus.BAD_REQUEST)
                            .code(400)
                            .data("Failed to retrieve booking details: " + e.getMessage())
                            .build()
            );
        }
    }

    @Operation(summary = "Update booking status", description = "Update the status of a booking (Admin only)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Booking status updated successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class))),
            @ApiResponse(responseCode = "400", description = "Invalid booking ID or status"),
            @ApiResponse(responseCode = "403", description = "Unauthorized access (Admin only)")
    })
    @SecurityRequirement(name = "bearerAuth")
    @PutMapping("/status/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateBookingStatus(
            @PathVariable Long id,
            @Parameter(description = "New booking status", required = true) @RequestParam BookingStatus status) {
        try {
            AdminBookingResponse response = bookingService.updateBookingStatus(id, status);
            return ResponseEntity.status(HttpStatus.OK).body(
                    ResponseWrapper.builder()
                            .status(HttpStatus.OK)
                            .code(200)
                            .data(response)
                            .build()
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    ResponseWrapper.builder()
                            .status(HttpStatus.BAD_REQUEST)
                            .code(400)
                            .data("Failed to update booking status: " + e.getMessage())
                            .build()
            );
        }
    }
}
