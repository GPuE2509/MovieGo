package com.ra.base_spring_boot.controller;

import com.ra.base_spring_boot.dto.ResponseWrapper;
import com.ra.base_spring_boot.dto.req.FormTicketPrice;
import com.ra.base_spring_boot.dto.resp.TicketPriceResponse;
import com.ra.base_spring_boot.model.TicketPrice;
import com.ra.base_spring_boot.services.ITicketPriceService;
import io.swagger.v3.oas.annotations.Operation;
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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/ticket-prices")
@RequiredArgsConstructor
@Tag(name = "Ticket Price Management", description = "APIs for managing ticket prices (Admin only)")
public class TicketPriceController {

    @Autowired
    private final ITicketPriceService ticketPriceService;

    @Operation(summary = "Get all ticket prices", description = "Retrieve a paginated list of ticket prices with optional filters")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successful retrieval",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class))),
            @ApiResponse(responseCode = "400", description = "Invalid pagination parameters"),
            @ApiResponse(responseCode = "403", description = "Unauthorized access")

    })
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> getAllTicketPrices(
            @RequestParam(required = false) String typeSeat,
            @RequestParam(required = false) String typeMovie,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<TicketPrice> ticketPrices = ticketPriceService.getAllTicketPrices(typeSeat, typeMovie, sortBy, pageable);
        Page<TicketPriceResponse> response = ticketPrices.map(ticketPrice -> TicketPriceResponse.builder()
                .id(ticketPrice.getId())
                .typeSeat(ticketPrice.getTypeSeat())
                .typeMovie(ticketPrice.getTypeMovie())
                .price(ticketPrice.getPrice())
                .dayType(ticketPrice.isDayType())
                .startTime(ticketPrice.getStartTime())
                .endTime(ticketPrice.getEndTime())
                .build());
        return ResponseEntity.ok().body(
                ResponseWrapper.<Page<TicketPriceResponse>>builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data(response)
                        .build()
        );
    }

    @Operation(summary = "Get ticket price by ID", description = "Retrieve a specific ticket price by its ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successful retrieval",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class))),
            @ApiResponse(responseCode = "404", description = "Ticket price not found"),
            @ApiResponse(responseCode = "403", description = "Unauthorized access")
    })
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> getTicketPriceById(@PathVariable Long id) {
        TicketPrice ticketPrice = ticketPriceService.getTicketPriceById(id);
        TicketPriceResponse response = TicketPriceResponse.builder()
                .id(ticketPrice.getId())
                .typeSeat(ticketPrice.getTypeSeat())
                .typeMovie(ticketPrice.getTypeMovie())
                .price(ticketPrice.getPrice())
                .dayType(ticketPrice.isDayType())
                .startTime(ticketPrice.getStartTime())
                .endTime(ticketPrice.getEndTime())
                .build();
        return ResponseEntity.ok().body(
                ResponseWrapper.<TicketPriceResponse>builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data(response)
                        .build()
        );
    }

    @Operation(summary = "Add a new ticket price", description = "Create a new ticket price")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Ticket price created successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input data"),
            @ApiResponse(responseCode = "403", description = "Unauthorized access")
    })
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping("/create")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> addTicketPrice(@RequestBody FormTicketPrice formTicketPrice) {
        TicketPrice ticketPrice = TicketPrice.builder()
                .typeSeat(formTicketPrice.getTypeSeat())
                .typeMovie(formTicketPrice.getTypeMovie())
                .price(formTicketPrice.getPrice())
                .dayType(formTicketPrice.isDayType())
                .startTime(formTicketPrice.getStartTime())
                .endTime(formTicketPrice.getEndTime())
                .build();
        TicketPrice savedTicketPrice = ticketPriceService.addTicketPrice(ticketPrice);
        TicketPriceResponse response = TicketPriceResponse.builder()
                .id(savedTicketPrice.getId())
                .typeSeat(savedTicketPrice.getTypeSeat())
                .typeMovie(savedTicketPrice.getTypeMovie())
                .price(savedTicketPrice.getPrice())
                .dayType(savedTicketPrice.isDayType())
                .startTime(savedTicketPrice.getStartTime())
                .endTime(savedTicketPrice.getEndTime())
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ResponseWrapper.<TicketPriceResponse>builder()
                        .status(HttpStatus.CREATED)
                        .code(201)
                        .data(response)
                        .build()
        );
    }

    @Operation(summary = "Update a ticket price", description = "Update an existing ticket price by ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Ticket price updated successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input data"),
            @ApiResponse(responseCode = "403", description = "Unauthorized access"),
            @ApiResponse(responseCode = "404", description = "Ticket price not found")
    })
    @SecurityRequirement(name = "bearerAuth")
    @PutMapping("/update/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> updateTicketPrice(@PathVariable Long id, @RequestBody FormTicketPrice formTicketPrice) {
        TicketPrice ticketPrice = TicketPrice.builder()
                .typeSeat(formTicketPrice.getTypeSeat())
                .typeMovie(formTicketPrice.getTypeMovie())
                .price(formTicketPrice.getPrice())
                .dayType(formTicketPrice.isDayType())
                .startTime(formTicketPrice.getStartTime())
                .endTime(formTicketPrice.getEndTime())
                .build();
        TicketPrice updatedTicketPrice = ticketPriceService.updateTicketPrice(id, ticketPrice);
        TicketPriceResponse response = TicketPriceResponse.builder()
                .id(updatedTicketPrice.getId())
                .typeSeat(updatedTicketPrice.getTypeSeat())
                .typeMovie(updatedTicketPrice.getTypeMovie())
                .price(updatedTicketPrice.getPrice())
                .dayType(updatedTicketPrice.isDayType())
                .startTime(updatedTicketPrice.getStartTime())
                .endTime(updatedTicketPrice.getEndTime())
                .build();
        return ResponseEntity.ok().body(
                ResponseWrapper.<TicketPriceResponse>builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data(response)
                        .build()
        );
    }

    @Operation(summary = "Delete a ticket price", description = "Delete a ticket price by ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Ticket price deleted successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class))),
            @ApiResponse(responseCode = "404", description = "Ticket price not found"),
            @ApiResponse(responseCode = "403", description = "Unauthorized access")
    })
    @SecurityRequirement(name = "bearerAuth")
    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> deleteTicketPrice(@PathVariable Long id) {
        ticketPriceService.deleteTicketPrice(id);
        return ResponseEntity.ok().body(
                ResponseWrapper.<String>builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data("Ticket price deleted successfully")
                        .build()
        );
    }
}