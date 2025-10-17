package com.ra.base_spring_boot.controller;

import com.ra.base_spring_boot.dto.ResponseWrapper;
import com.ra.base_spring_boot.dto.resp.*;
import com.ra.base_spring_boot.model.*;
import com.ra.base_spring_boot.services.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Collections;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Home API", description = "APIs for managing feature of Home page")
@Validated
public class HomeController {
    private final IMovieService movieService;
    private final INewsService newService;
    private final IFestivalService festivalService;
    private final ITicketPriceService ticketPriceService;
    private final IGenreService genreService;
    private final IPromotionService promotionService;
    private final Logger logger = LoggerFactory.getLogger(HomeController.class);

    @Operation(summary = "Get all genres", description = "Retrieve a list of all genres")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successful retrieval",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class))),
    })
    @GetMapping("/get-all-genres")
    public ResponseEntity<?> getAllGenres() {
        List<Genre> genres = genreService.getAllGenres();
        return ResponseEntity.status(HttpStatus.OK).body(
                ResponseWrapper.builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data(genres)
                        .build()
        );
    }

    @Operation(summary = "Get theaters near a location", description = "Retrieve theaters based on user's latitude, longitude, a search radius in kilometers, and a specific date.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successful retrieval",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class))),
            @ApiResponse(responseCode = "404", description = "No theaters found near the location",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class)))
    })
    @GetMapping("/theaters-near")
    public ResponseEntity<?> getTheatersNear(
            @RequestParam(name = "lat") @Min(-90) @Max(90) double lat,
            @RequestParam(name = "lon") @Min(-180) @Max(180) double lon,
            @RequestParam(name = "radius", defaultValue = "5") @Min(1) double radius,
            @RequestParam(name = "date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(name = "limit", defaultValue = "10") @Min(1) int limit) {
        try {
            List<TheaterDTO> result = movieService.getTheatersNear(lat, lon, radius, date, limit);
            if (result == null || result.isEmpty()) {
                return ResponseEntity.status(HttpStatus.OK).body(
                        ResponseWrapper.builder()
                                .status(HttpStatus.OK)
                                .code(200)
                                .data(Collections.emptyList())
                                .build()
                );
            }
            return ResponseEntity.status(HttpStatus.OK).body(
                    ResponseWrapper.builder()
                            .status(HttpStatus.OK)
                            .code(200)
                            .data(result)
                            .build()
            );
        } catch (NullPointerException e) {
            logger.error("NullPointerException occurred", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    ResponseWrapper.builder()
                            .status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .code(500)
                            .data("Internal server error: " + e.getMessage())
                            .build()
            );
        } catch (Exception e) {
            logger.error("Unexpected error", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    ResponseWrapper.builder()
                            .status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .code(500)
                            .data("Internal server error")
                            .build()
            );
        }
    }

    @Operation(summary = "Get all movies showing", description = "Retrieve a list of all movies released today")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successful retrieval",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class))),
    })
    @GetMapping("/now-showing")
    public ResponseEntity<?> getAllMoviesShowing() {
        Date now = new Date();
        List<MovieResponse> movies = movieService.getAllMoviesShowing(now);
        return ResponseEntity.status(HttpStatus.OK).body(
                ResponseWrapper.builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data(movies)
                        .build()
        );
    }

    @Operation(summary = "Get all movies coming", description = "Retrieve a list of all movies coming soon")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successful retrieval",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class))),
    })
    @GetMapping("/now-coming")
    public ResponseEntity<?> getAllMoviesComing(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) int pageSize) {
        Date now = new Date();
        Object data;
        if (page == 0 && pageSize == Integer.MAX_VALUE) {
            List<MovieResponse> movies = movieService.getAllMoviesComing(now);
            data = movies;
        } else {
            Pageable pageable = PageRequest.of(page, pageSize, Sort.by("releaseDate"));
            Page<Movie> moviePage = movieService.findByReleaseDateAfter(now, pageable);
            List<MovieResponse> movieResponses = moviePage.getContent().stream()
                    .map(movie -> MovieResponse.builder()
                            .id(movie.getId())
                            .title(movie.getTitle())
                            .description(movie.getDescription())
                            .author(movie.getAuthor())
                            .image(movie.getImage())
                            .actors(movie.getActors())
                            .trailer(movie.getTrailer())
                            .type(movie.getType())
                            .duration(movie.getDuration())
                            .nations(movie.getNation())
                            .releaseDate(movie.getReleaseDate())
                            .createdAt(movie.getCreatedAt())
                            .updatedAt(movie.getUpdatedAt())
                            .genreNames(movie.getGenres() != null ?
                                    movie.getGenres().stream()
                                            .map(Genre::getGenreName)
                                            .collect(Collectors.toSet()) :
                                    new HashSet<>())
                            .build())
                    .collect(Collectors.toList());
            data = PageResponse.<MovieResponse>builder()
                    .total(moviePage.getTotalElements())
                    .page(moviePage.getNumber())
                    .size(moviePage.getSize())
                    .data(movieResponses)
                    .totalPages(moviePage.getTotalPages())
                    .hasNext(moviePage.hasNext())
                    .hasPrevious(moviePage.hasPrevious())
                    .build();
        }
        return ResponseEntity.status(HttpStatus.OK).body(
                ResponseWrapper.builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data(data)
                        .build()
        );
    }

    @Operation(summary = "Get a movie detail", description = "Retrieve a movie detail")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successful retrieval",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class))),
    })
    @GetMapping("/get-movie-detail/{Id}")
    public ResponseEntity<?> getMovieDetail(@PathVariable Long Id, Authentication authentication) {
        Movie movie = movieService.getMovieDetail(Id)
                .orElseThrow(() -> new RuntimeException("Movie not found"));
        MovieResponse movieResponse = MovieResponse.builder()
                .id(movie.getId())
                .title(movie.getTitle())
                .description(movie.getDescription())
                .author(movie.getAuthor())
                .image(movie.getImage())
                .actors(movie.getActors())
                .trailer(movie.getTrailer())
                .type(movie.getType())
                .duration(movie.getDuration())
                .nations(movie.getNation())
                .releaseDate(movie.getReleaseDate())
                .createdAt(movie.getCreatedAt())
                .updatedAt(movie.getUpdatedAt())
                .genreNames(movie.getGenres().stream().map(Genre::getGenreName).collect(Collectors.toSet()))
                .build();
        return ResponseEntity.status(HttpStatus.OK).body(
                ResponseWrapper.builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data(movieResponse)
                        .build()
        );
    }

    @Operation(summary = "Get a movie trailer", description = "Retrieve a movie trailer")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successful retrieval",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class))),
    })
    @GetMapping("/get-movie-trailer/{Id}")
    public ResponseEntity<?> getMovieTrailer(@PathVariable Long Id) {
        String url = movieService.getMovieTrailer(Id)
                .orElseThrow(() -> new RuntimeException("Trailer not found"));
        return ResponseEntity.status(HttpStatus.OK).body(
                ResponseWrapper.builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data(url)
                        .build()
        );
    }

    @Operation(summary = "Get all news", description = "Retrieve a list of all news")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successful retrieval",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class))),
    })
    @GetMapping("/get-all-news")
    public ResponseEntity<?> getAllNews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(defaultValue = "title") String sortField,
            @RequestParam(defaultValue = "asc") String sortOrder,
            @RequestParam(defaultValue = "") String search) {
        PageResponse<NewResponse> newResponse = newService.getAllNews(page, pageSize, sortField, sortOrder, search);
        return ResponseEntity.status(HttpStatus.OK).body(
                ResponseWrapper.builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data(newResponse)
                        .build()
        );
    }

    @Operation(summary = "Get a new", description = "Retrieve a new")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successful retrieval",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class))),
    })
    @GetMapping("/get-new-by-id/{Id}")
    public ResponseEntity<?> getNewById(@PathVariable Long Id) {
        NewResponse newResponse = newService.getNewById(Id);
        return ResponseEntity.status(HttpStatus.OK).body(
                ResponseWrapper.builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data(newResponse)
                        .build()
        );
    }

    @Operation(summary = "Get all festivals", description = "Retrieve a list of all festivals")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successful retrieval",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class))),
    })
    @GetMapping("/get-all-festivals")
    public ResponseEntity<?> getAllFestivals(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(defaultValue = "title") String sortField,
            @RequestParam(defaultValue = "asc") String sortOrder,
            @RequestParam(defaultValue = "") String search) {
        PageResponse<FestivalResponse> festivalResponse = festivalService.getAllFestivals(page, pageSize, sortField, sortOrder, search);
        return ResponseEntity.status(HttpStatus.OK).body(
                ResponseWrapper.builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data(festivalResponse)
                        .build()
        );
    }

    @Operation(summary = "Get all promotions", description = "Retrieve a list of all promotions")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successful retrieval",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class))),
    })
    @GetMapping("/get-all-promotion")
    public ResponseEntity<?> getAllPromotions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(defaultValue = "title") String sortField,
            @RequestParam(defaultValue = "asc") String sortOrder,
            @RequestParam(defaultValue = "") String search) {
        PageResponse<PromotionResp> promotionResponse = promotionService.getAllPromotions(page, pageSize, sortField, sortOrder, search);
        return ResponseEntity.status(HttpStatus.OK).body(
                ResponseWrapper.builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data(promotionResponse)
                        .build()
        );
    }

    @Operation(summary = "Get a festival detail", description = "Retrieve a festival detail")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successful retrieval",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class))),
    })
    @GetMapping("/get-festival-detail/{Id}")
    public ResponseEntity<?> getFestivalDetail(@PathVariable Long Id) {
        FestivalResponse festival = festivalService.getFestivalDetail(Id)
                .orElseThrow(() -> new RuntimeException("Festival not found"));
        return ResponseEntity.status(HttpStatus.OK).body(
                ResponseWrapper.builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data(festival)
                        .build()
        );
    }

    @Operation(summary = "Get a festival detail", description = "Retrieve a festival detail")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successful retrieval",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class))),
    })
    @GetMapping("/get-promotion-detail/{Id}")
    public ResponseEntity<?> getPromotionDetail(@PathVariable Long Id) {
        PromotionResp promotion = promotionService.getPromotionDetail(Id)
                .orElseThrow(() -> new RuntimeException("Promotion not found"));
        return ResponseEntity.status(HttpStatus.OK).body(
                ResponseWrapper.builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data(promotion)
                        .build()
        );
    }

    @Operation(summary = "Get a list ticket price", description = "Retrieve a list ticket price")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successful retrieval",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class))),
    })
    @GetMapping("/get-all-ticket-price")
    public ResponseEntity<?> getAllTicketPrice() {
        List<TicketPriceResponse> ticketPrices = ticketPriceService.getAllTicketPricesForHomePage();
        return ResponseEntity.status(HttpStatus.OK).body(
                ResponseWrapper.builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data(ticketPrices)
                        .build()
        );
    }

}