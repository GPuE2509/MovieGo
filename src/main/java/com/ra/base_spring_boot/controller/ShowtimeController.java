package com.ra.base_spring_boot.controller;

import com.ra.base_spring_boot.dto.ResponseWrapper;
import com.ra.base_spring_boot.dto.req.FormShowtime;
import com.ra.base_spring_boot.dto.resp.AvailableDateResponse;
import com.ra.base_spring_boot.dto.resp.PageResponse;
import com.ra.base_spring_boot.dto.resp.ShowtimeResponse;
import com.ra.base_spring_boot.dto.resp.ShowtimeSeatResponse;
import com.ra.base_spring_boot.services.IShowtimeService;
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
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/api/v1/")
@RequiredArgsConstructor
@Tag(name = "Showtime", description = "APIs for select showtime")
public class ShowtimeController {

    @Autowired
    private IShowtimeService showtimeService;

    /**
     * Lấy danh sách suất chiếu theo movieId với phân trang
     */
    @Operation(summary = "Get showtimes by movie ID", description = "Retrieve a paginated list of showtimes for a specific movie")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successful retrieval",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class))),
            @ApiResponse(responseCode = "400", description = "Invalid parameters"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @GetMapping("/movie/{movieId}")
    public ResponseEntity<?> getShowtimesByMovieId(
            @PathVariable Long movieId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {

        try {
            PageResponse<ShowtimeResponse> showtimes = showtimeService.findByMovieId(movieId, page, size);
            return ResponseEntity.status(HttpStatus.OK).body(
                    ResponseWrapper.builder()
                            .status(HttpStatus.OK)
                            .code(200)
                            .data(showtimes)
                            .build()
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    ResponseWrapper.builder()
                            .status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .code(500)
                            .data("Lỗi khi lấy danh sách suất chiếu: " + e.getMessage())
                            .build()
            );
        }
    }

    @Operation(summary = "Get showtimes by movie ID and theater", description = "Retrieve paginated showtimes for a specific movie and theater")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successful retrieval",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = PageResponse.class))),
            @ApiResponse(responseCode = "404", description = "Movie or theater not found")
    })
    @GetMapping("/showtimes/movie/{movieId}")
    public ResponseEntity<?> getShowtimesByMovieIdAndTheater(
            @PathVariable Long movieId,
            @RequestParam(required = false) Long theaterId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date date) {
        try {
            PageResponse<ShowtimeResponse> response = showtimeService.findShowtimesByMovieIdAndTheater(movieId, theaterId, page, size, date);
            return ResponseEntity.status(HttpStatus.OK).body(
                    ResponseWrapper.builder()
                            .status(HttpStatus.OK)
                            .code(200)
                            .data(response)
                            .build()
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    ResponseWrapper.builder()
                            .status(HttpStatus.NOT_FOUND)
                            .code(404)
                            .data("Movie or theater not found: " + e.getMessage())
                            .build()
            );
        }
    }

    @Operation(summary = "Get available dates for a movie and theater", description = "Retrieve list of available show dates for a specific movie and theater")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successful retrieval",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class))),
            @ApiResponse(responseCode = "404", description = "Movie or theater not found or no available dates")
    })
    @GetMapping("/showtimes/dates/{movieId}")
    public ResponseEntity<?> getAvailableDatesByMovieIdAndTheater(@PathVariable Long movieId, @RequestParam(required = false) Long theaterId) {
        try {
            List<AvailableDateResponse> response = showtimeService.getAvailableDatesByMovieIdAndTheater(movieId, theaterId);
            return ResponseEntity.ok(
                    ResponseWrapper.builder()
                            .status(HttpStatus.OK)
                            .code(200)
                            .data(response)
                            .build()
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    ResponseWrapper.builder()
                            .status(HttpStatus.NOT_FOUND)
                            .code(404)
                            .data("No available dates found: " + e.getMessage())
                            .build()
            );
        }
    }

    @Operation(summary = "Create a new showtime", description = "Create a new showtime for a movie and screen")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Showtime created successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ShowtimeResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input data")
    })
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PostMapping("/admin/showtime/create")
    public ResponseEntity<?> createShowtime(@Valid @RequestBody FormShowtime form) {
        try {
            ShowtimeResponse response = showtimeService.createShowtime(form);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    ResponseWrapper.builder()
                            .status(HttpStatus.BAD_REQUEST)
                            .code(400)
                            .data("Invalid input: " + e.getMessage())
                            .build()
            );
        }
    }

    @Operation(summary = "Get showtime by ID", description = "Retrieve a specific showtime by ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successful retrieval",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ShowtimeResponse.class))),
            @ApiResponse(responseCode = "404", description = "Showtime not found")
    })
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasAnyAuthority('ROLE_USER', 'ROLE_ADMIN')")
    @GetMapping("/showtime/{id}")
    public ResponseEntity<?> getShowtimeById(@PathVariable Long id) {
        try {
            ShowtimeResponse response = showtimeService.findById(id);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    ResponseWrapper.builder()
                            .status(HttpStatus.NOT_FOUND)
                            .code(404)
                            .data("Showtime not found: " + e.getMessage())
                            .build()
            );
        }
    }

    @Operation(summary = "Delete a showtime", description = "Delete a showtime by ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Showtime deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Showtime not found")
    })
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @DeleteMapping("/admin/showtime/delete/{id}")
    public ResponseEntity<?> deleteShowtime(@PathVariable Long id) {
        try {
            showtimeService.deleteShowtime(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    ResponseWrapper.builder()
                            .status(HttpStatus.NOT_FOUND)
                            .code(404)
                            .data("Showtime not found: " + e.getMessage())
                            .build()
            );
        }
    }

    @Operation(summary = "Get seats for a specific showtime and theater", description = "Retrieve list of seats with availability status for a given showtime ID and theater")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successful retrieval",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class))),
            @ApiResponse(responseCode = "404", description = "Showtime or theater not found")
    })
    @GetMapping("/showtimes/{showtimeId}/seats")
    public ResponseEntity<?> getSeatsByShowtimeId(@PathVariable Long showtimeId,
                                                  @RequestParam(required = false) Long theaterId) {
        try {
            List<ShowtimeSeatResponse> seats = showtimeService.getSeatsByShowtimeIdAndTheater(showtimeId, theaterId);
            return ResponseEntity.status(HttpStatus.OK).body(
                    ResponseWrapper.builder()
                            .status(HttpStatus.OK)
                            .code(200)
                            .data(seats)
                            .build()
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    ResponseWrapper.builder()
                            .status(HttpStatus.NOT_FOUND)
                            .code(404)
                            .data("Showtime or theater not found: " + e.getMessage())
                            .build()
            );
        }
    }

    @Operation(
            summary = "Get showtimes by movie, theater and date",
            description = "Retrieve all showtimes for a specific movie and theater on a given date"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Successful retrieval",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class))),
            @ApiResponse(responseCode = "400", description = "Invalid parameters"),
            @ApiResponse(responseCode = "404", description = "No showtimes found")
    })
    @GetMapping("/showtime/movie/{movieId}/theater/{theaterId}")
    public ResponseEntity<?> getShowtimesByMovieAndTheater(
            @PathVariable Long movieId,
            @PathVariable Long theaterId,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") Date date
    ) {
        List<ShowtimeResponse> list = showtimeService
                .findShowtimesByMovieAndTheaterAndDate(movieId, theaterId, date);

        return ResponseEntity.ok(
                ResponseWrapper.builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data(list)
                        .build()
        );
    }

    @Operation(summary = "Get showtimes by movie ID and theater, screen", description = "Retrieve paginated showtimes for a specific movie and theater")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Showtime deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Showtime not found")
    })
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @GetMapping("/admin/showtimes/movie/{movieId}")
    public ResponseEntity<?> getShowtimesAdminByMovieIdAndTheater(
            @PathVariable Long movieId,
            @RequestParam(required = false) Long theaterId,
            @RequestParam(required = false) Long screenId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date date) {
        try {
            PageResponse<ShowtimeResponse> response = showtimeService.findShowtimesByMovieIdTheaterAndScreen(movieId, theaterId, screenId, page, size, date);
            return ResponseEntity.status(HttpStatus.OK).body(
                    ResponseWrapper.builder()
                            .status(HttpStatus.OK)
                            .code(200)
                            .data(response)
                            .build()
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    ResponseWrapper.builder()
                            .status(HttpStatus.NOT_FOUND)
                            .code(404)
                            .data("Movie or theater not found: " + e.getMessage())
                            .build()
            );
        }
    }
}