package com.ra.base_spring_boot.controller;

import com.ra.base_spring_boot.dto.ResponseWrapper;
import com.ra.base_spring_boot.dto.resp.NewsEventStatisticsResponse;
import com.ra.base_spring_boot.dto.resp.SupplierRevenueResponse;
import com.ra.base_spring_boot.dto.resp.TicketStatisticsResponse;
import com.ra.base_spring_boot.services.IStatisticService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/statistics")
@Tag(name = "Statistics Management", description = "APIs for managing statistics (Admin only)")
public class StatisticController {

    private static final Logger log = LoggerFactory.getLogger(StatisticController.class);

    @Autowired
    private IStatisticService statisticService;

    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Get user statistics", description = "Retrieve statistics about users")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User statistics retrieved successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class)))
    })
    @GetMapping("/users")
    public ResponseEntity<ResponseWrapper<?>> getUserStatistics() {
        try {
            Map<String, Long> data = statisticService.getUserStatistics();
            if (data == null) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                        ResponseWrapper.builder()
                                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .code(500)
                                .data("Failed to retrieve user statistics: Data is null")
                                .build()
                );
            }
            return ResponseEntity.ok(
                    ResponseWrapper.<Map<String, Long>>builder()
                            .status(HttpStatus.OK)
                            .code(200)
                            .data(data.isEmpty() ? Map.of() : data)
                            .build()
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    ResponseWrapper.builder()
                            .status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .code(500)
                            .data("An unexpected error occurred: " + e.getMessage())
                            .build()
            );
        }
    }

    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Get movie statistics", description = "Retrieve statistics about movies")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Movie statistics retrieved successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class)))
    })
    @GetMapping("/movies")
    public ResponseEntity<ResponseWrapper<?>> getMovieStatistics() {
        try {
            Map<String, Object> data = statisticService.getMovieStatistics();
            if (data == null) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                        ResponseWrapper.builder()
                                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .code(500)
                                .data("Failed to retrieve movie statistics: Data is null")
                                .build()
                );
            }
            return ResponseEntity.ok(
                    ResponseWrapper.<Map<String, Object>>builder()
                            .status(HttpStatus.OK)
                            .code(200)
                            .data(data.isEmpty() ? Map.of() : data)
                            .build()
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    ResponseWrapper.builder()
                            .status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .code(500)
                            .data("An unexpected error occurred: " + e.getMessage())
                            .build()
            );
        }
    }

    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Get revenue statistics", description = "Retrieve total revenue within a date range")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Revenue statistics retrieved successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class))),
            @ApiResponse(responseCode = "400", description = "Invalid date range",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class)))
    })
    @GetMapping("/revenue")
    public ResponseEntity<ResponseWrapper<?>> getRevenueStatistics(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date endDate) {
        if (startDate.after(endDate)) {
            return ResponseEntity.badRequest().body(
                    ResponseWrapper.builder()
                            .status(HttpStatus.BAD_REQUEST)
                            .code(400)
                            .data("Invalid date range: startDate must be before endDate")
                            .build()
            );
        }
        try {
            Map<String, Double> data = statisticService.getRevenueStatistics(startDate, endDate);
            if (data == null) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                        ResponseWrapper.builder()
                                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .code(500)
                                .data("Failed to retrieve revenue statistics: Data is null")
                                .build()
                );
            }
            return ResponseEntity.ok(
                    ResponseWrapper.<Map<String, Double>>builder()
                            .status(HttpStatus.OK)
                            .code(200)
                            .data(data.isEmpty() ? Map.of() : data)
                            .build()
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    ResponseWrapper.builder()
                            .status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .code(500)
                            .data("An unexpected error occurred: " + e.getMessage())
                            .build()
            );
        }
    }

    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Get ticket statistics", description = "Retrieve total tickets sold, per theater, and per movie within a date range")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Ticket statistics retrieved successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class))),
            @ApiResponse(responseCode = "400", description = "Invalid date range",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class)))
    })
    @GetMapping("/tickets")
    public ResponseEntity<ResponseWrapper<?>> getTicketStatistics(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date endDate) {
        if (startDate.after(endDate)) {
            return ResponseEntity.badRequest().body(
                    ResponseWrapper.builder()
                            .status(HttpStatus.BAD_REQUEST)
                            .code(400)
                            .data("Invalid date range: startDate must be before endDate")
                            .build()
            );
        }
        try {
            TicketStatisticsResponse data = statisticService.getTicketStatistics(startDate, endDate);
            if (data == null) {
                log.error("Ticket statistics data is null for range: {} to {}", startDate, endDate);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                        ResponseWrapper.builder()
                                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .code(500)
                                .data("Failed to retrieve ticket statistics: Data is null")
                                .build()
                );
            }
            return ResponseEntity.ok(
                    ResponseWrapper.<TicketStatisticsResponse>builder()
                            .status(HttpStatus.OK)
                            .code(200)
                            .data(data)
                            .build()
            );
        } catch (Exception e) {
            log.error("Error in getTicketStatistics for range: {} to {}", startDate, endDate, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    ResponseWrapper.builder()
                            .status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .code(500)
                            .data("An unexpected error occurred: " + e.getMessage())
                            .build()
            );
        }
    }

    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Get news and event statistics", description = "Retrieve total number of news and festivals")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "News and event statistics retrieved successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class)))
    })
    @GetMapping("/news-events")
    public ResponseEntity<ResponseWrapper<?>> getNewsEventStatistics() {
        try {
            NewsEventStatisticsResponse data = statisticService.getNewsEventStatistics();
            if (data == null) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                        ResponseWrapper.builder()
                                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .code(500)
                                .data("Failed to retrieve news and event statistics: Data is null")
                                .build()
                );
            }
            return ResponseEntity.ok(
                    ResponseWrapper.<NewsEventStatisticsResponse>builder()
                            .status(HttpStatus.OK)
                            .code(200)
                            .data(data)
                            .build()
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    ResponseWrapper.builder()
                            .status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .code(500)
                            .data("An unexpected error occurred: " + e.getMessage())
                            .build()
            );
        }
    }

    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Get supplier revenue statistics", description = "Retrieve revenue by distributor within a date range")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Supplier revenue statistics retrieved successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class))),
            @ApiResponse(responseCode = "400", description = "Invalid date range",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class)))
    })
    @GetMapping("/suppliers")
    public ResponseEntity<ResponseWrapper<?>> getSupplierRevenue(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date endDate) {
        if (startDate.after(endDate)) {
            return ResponseEntity.badRequest().body(
                    ResponseWrapper.builder()
                            .status(HttpStatus.BAD_REQUEST)
                            .code(400)
                            .data("Invalid date range: startDate must be before endDate")
                            .build()
            );
        }
        try {
            SupplierRevenueResponse data = statisticService.getSupplierRevenue(startDate, endDate);
            if (data == null) {
                log.error("Supplier revenue data is null for range: {} to {}", startDate, endDate);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                        ResponseWrapper.builder()
                                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .code(500)
                                .data("Failed to retrieve supplier revenue statistics: Data is null")
                                .build()
                );
            }
            return ResponseEntity.ok(
                    ResponseWrapper.<SupplierRevenueResponse>builder()
                            .status(HttpStatus.OK)
                            .code(200)
                            .data(data)
                            .build()
            );
        } catch (Exception e) {
            log.error("Error in getSupplierRevenue for range: {} to {}", startDate, endDate, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    ResponseWrapper.builder()
                            .status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .code(500)
                            .data("An unexpected error occurred: " + e.getMessage())
                            .build()
            );
        }
    }
}