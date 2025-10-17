package com.ra.base_spring_boot.controller;

import com.ra.base_spring_boot.dto.ResponseWrapper;
import com.ra.base_spring_boot.dto.resp.TicketPriceResponse;
import com.ra.base_spring_boot.model.Showtime;
import com.ra.base_spring_boot.services.IShowtimeService;
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

import java.util.Optional;

@RestController
@RequestMapping("/api/v1/")
@RequiredArgsConstructor
@Tag(name = "Ticket Price", description = "APIs for retrieving ticket prices")
public class PublicTicketPriceController {

    @Autowired
    private ITicketPriceService ticketPriceService;

    @Autowired
    private IShowtimeService showtimeService;

    @Operation(summary = "Get ticket price by seat type and movie type", description = "Retrieve ticket price based on seat type and movie type")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successful retrieval",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class))),
            @ApiResponse(responseCode = "400", description = "Invalid seat type or movie type")
    })
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasAnyAuthority('ROLE_USER', 'ROLE_ADMIN')")
    @GetMapping("/ticket-prices")
    public ResponseEntity<?> getTicketPrice(
            @RequestParam String typeSeat,
            @RequestParam String typeMovie) {
        TicketPriceResponse price = ticketPriceService.getPriceBySeatAndMovieType(typeSeat, typeMovie);
        return ResponseEntity.ok().body(
                ResponseWrapper.builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data(price)
                        .build()
        );
    }


    @Operation(summary = "Get applicable ticket prices for a showtime", description = "Retrieve ticket prices applicable for a specific showtime")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successful retrieval",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class))),
            @ApiResponse(responseCode = "404", description = "No applicable prices found"),
            @ApiResponse(responseCode = "403", description = "Unauthorized access")
    })
    @GetMapping("/ticket-price/applicable/{showtimeId}")
    public ResponseEntity<?> getApplicableTicketPrices(
            @PathVariable Long showtimeId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Optional<Showtime> showtimeOptional = showtimeService.findShowById(showtimeId);
        Showtime showtime = showtimeOptional.orElseThrow(() ->
                new NullPointerException("Showtime not found with ID: " + showtimeId));

        Pageable pageable = PageRequest.of(page, size);
        Page<TicketPriceResponse> response = ticketPriceService.getApplicableTicketPrices(showtime, pageable);
        return ResponseEntity.status(HttpStatus.OK).body(
                ResponseWrapper.builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data(response)
                        .build()
        );
    }
}