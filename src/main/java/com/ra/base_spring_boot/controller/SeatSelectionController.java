package com.ra.base_spring_boot.controller;

import com.ra.base_spring_boot.dto.ResponseWrapper;
import com.ra.base_spring_boot.dto.resp.RowSeatResponse;
import com.ra.base_spring_boot.services.ISeatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/")
@RequiredArgsConstructor
@Tag(name = "Seat Selection", description = "APIs for users to select and view seat availability")
public class SeatSelectionController {

    @Autowired
    private ISeatService seatService;

    @Operation(summary = "Get seat status for a showtime and theater", description = "Retrieve the status of seats for a specific showtime and theater")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successful retrieval",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = RowSeatResponse.class))),
            @ApiResponse(responseCode = "404", description = "Showtime or theater not found"),
            @ApiResponse(responseCode = "400", description = "Invalid input")
    })
    @GetMapping("/seat/showtime/{showtimeId}")
    public ResponseEntity<?> getSeatStatus(@PathVariable Long showtimeId, @RequestParam(required = false) Long theaterId) {
        if (showtimeId == null || showtimeId <= 0) {
            return ResponseEntity.badRequest().body(
                    ResponseWrapper.builder()
                            .status(HttpStatus.BAD_REQUEST)
                            .code(400)
                            .data("Invalid showtimeId")
                            .build()
            );
        }
        List<RowSeatResponse> seatStatuses = seatService.getSeatStatusByShowtimeAndTheater(showtimeId, theaterId);
        return ResponseEntity.ok(
                ResponseWrapper.builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data(seatStatuses)
                        .build()
        );
    }
}