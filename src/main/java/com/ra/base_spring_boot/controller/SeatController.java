package com.ra.base_spring_boot.controller;

import com.ra.base_spring_boot.dto.ResponseWrapper;
import com.ra.base_spring_boot.dto.resp.PageResponse;
import com.ra.base_spring_boot.dto.resp.RowSeatResponse;
import com.ra.base_spring_boot.dto.resp.SeatResponse;
import com.ra.base_spring_boot.dto.req.FormSeat;
import com.ra.base_spring_boot.services.ISeatService;
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
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@Tag(name = "Seat Management", description = "APIs for managing seats (Admin only)")
public class SeatController {

    @Autowired
    private ISeatService seatService;

    @Operation(summary = "Get all seats", description = "Retrieve a paginated list of seats with optional search and sorting")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successful retrieval",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = PageResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid pagination parameters"),
            @ApiResponse(responseCode = "403", description = "Unauthorized access")
    })
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @GetMapping("/seats")
    public ResponseEntity<?> getAllSeats(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "seatNumber") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {
        Sort sort = Sort.by(direction.equalsIgnoreCase("asc") ? Sort.Order.asc(sortBy) : Sort.Order.desc(sortBy));
        Pageable pageable = PageRequest.of(page, size, sort);
        PageResponse<SeatResponse> response = seatService.getAllSeats(keyword, pageable);
        return ResponseEntity.status(HttpStatus.OK).body(
                ResponseWrapper.builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data(response)
                        .build()
        );
    }

    @Operation(summary = "Add a new seat", description = "Create a new seat")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Seat created successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = SeatResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input data"),
            @ApiResponse(responseCode = "403", description = "Unauthorized access")
    })
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PostMapping("/seat/create")
    public ResponseEntity<SeatResponse> createSeat(@Valid @RequestBody FormSeat formSeat) {
        SeatResponse response = seatService.createSeat(formSeat);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "Update a seat", description = "Update an existing seat by ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Seat updated successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = SeatResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input data"),
            @ApiResponse(responseCode = "403", description = "Unauthorized access"),
            @ApiResponse(responseCode = "404", description = "Seat not found")
    })
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PutMapping("/seat/update/{id}")
    public ResponseEntity<?> updateSeat(@PathVariable Long id, @Valid @RequestBody FormSeat formSeat) {
        SeatResponse response = seatService.updateSeat(id, formSeat);
        return ResponseEntity.ok().body(
                ResponseWrapper.builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data(response)
                        .build()
        );
    }

    @Operation(summary = "Delete a seat", description = "Delete a seat by ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Seat deleted successfully"),
            @ApiResponse(responseCode = "403", description = "Unauthorized access"),
            @ApiResponse(responseCode = "404", description = "Seat not found")
    })
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @DeleteMapping("/seat/delete/{id}")
    public ResponseEntity<?> deleteSeat(@PathVariable Long id) {
        seatService.deleteSeat(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).body(
                ResponseWrapper.builder()
                        .status(HttpStatus.NO_CONTENT)
                        .code(204)
                        .data("Seat deleted successfully")
                        .build()
        );
    }

    @Operation(summary = "Get all deleted seats", description = "Retrieve a paginated list of deleted seats")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successful retrieval",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = PageResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid pagination parameters"),
            @ApiResponse(responseCode = "403", description = "Unauthorized access")
    })
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @GetMapping("seats/deleted")
    public ResponseEntity<?> getAllDeletedSeats(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "seatNumber") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {
        Sort sort = Sort.by(direction.equalsIgnoreCase("asc") ? Sort.Order.asc(sortBy) : Sort.Order.desc(sortBy));
        Pageable pageable = PageRequest.of(page, size, sort);
        PageResponse<SeatResponse> response = seatService.getAllDeletedSeats(keyword, pageable);
        return ResponseEntity.status(HttpStatus.OK).body(
                ResponseWrapper.builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data(response)
                        .build()
        );
    }

    @Operation(summary = "Restore a deleted seat", description = "Restore a seat by ID to active status")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Seat restored successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = SeatResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input data"),
            @ApiResponse(responseCode = "403", description = "Unauthorized access"),
            @ApiResponse(responseCode = "404", description = "Seat not found")
    })
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PutMapping("seat/restore/{id}")
    public ResponseEntity<?> restoreSeat(@PathVariable Long id) {
        SeatResponse response = seatService.restoreSeat(id);
        return ResponseEntity.ok().body(
                ResponseWrapper.builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data(response)
                        .build()
        );
    }

    @Operation(summary = "Get seat status for a showtime and theater including deleted seats for admin", description = "Retrieve the status of seats for a specific showtime and theater, including deleted seats for admin to restore")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successful retrieval",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = RowSeatResponse.class))),
            @ApiResponse(responseCode = "404", description = "Showtime or theater not found"),
            @ApiResponse(responseCode = "400", description = "Invalid input")
    })
    @GetMapping("seat/showtime/{showtimeId}")
    public ResponseEntity<?> getAdminSeatStatus(@PathVariable Long showtimeId, @RequestParam(required = false) Long theaterId) {
        if (showtimeId == null || showtimeId <= 0) {
            return ResponseEntity.badRequest().body(
                    ResponseWrapper.builder()
                            .status(HttpStatus.BAD_REQUEST)
                            .code(400)
                            .data("Invalid showtimeId")
                            .build()
            );
        }
        List<RowSeatResponse> seatStatuses = seatService.getAdminSeatStatusByShowtimeAndTheater(showtimeId, theaterId);
        return ResponseEntity.ok(
                ResponseWrapper.builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data(seatStatuses)
                        .build()
        );
    }
}