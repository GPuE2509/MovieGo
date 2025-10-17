package com.ra.base_spring_boot.controller;

import com.ra.base_spring_boot.dto.ResponseWrapper;
import com.ra.base_spring_boot.dto.resp.MovieResponse;
import com.ra.base_spring_boot.model.Genre;
import com.ra.base_spring_boot.model.Movie;
import com.ra.base_spring_boot.services.IMovieService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/movies")
@RequiredArgsConstructor
@Tag(name = "Public Movie Selection", description = "APIs for users to select movies with active showtimes")
public class PublicMovieController {

    @Autowired
    private final IMovieService movieService;

    @Operation(summary = "Get movies with active showtimes", description = "Retrieve a paginated list of movies that have active showtimes, with optional filters for date and theater")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successful retrieval",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class))),
            @ApiResponse(responseCode = "400", description = "Invalid pagination parameters")
    })
    @GetMapping
    public ResponseEntity<?> getMoviesWithShowtimes(
            @RequestParam(required = false) Date date,
            @RequestParam(required = false) Long theaterId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Movie> movies = movieService.getMoviesWithActiveShowtimes(date, theaterId, pageable);
        Page<MovieResponse> response = movies.map(movie -> MovieResponse.builder()
                .id(movie.getId())
                .title(movie.getTitle())
                .description(movie.getDescription())
                .author(movie.getAuthor())
                .image(movie.getImage())
                .trailer(movie.getTrailer())
                .type(movie.getType())
                .duration(movie.getDuration())
                .releaseDate(movie.getReleaseDate())
                .createdAt(movie.getCreatedAt())
                .updatedAt(movie.getUpdatedAt())
                .genreNames(movie.getGenres() != null ?
                        movie.getGenres().stream().map(Genre::getGenreName).collect(Collectors.toSet()) :
                        Set.of())
                .build());
        return ResponseEntity.status(HttpStatus.OK).body(
                ResponseWrapper.<Page<MovieResponse>>builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data(response)
                        .build()
        );
    }


    @Operation(summary = "Get movie details", description = "Retrieve detailed information of a specific movie by its ID for guests")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successful retrieval",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class))),
            @ApiResponse(responseCode = "404", description = "Movie not found")
    })
    @GetMapping("/{id}")
    public ResponseEntity<?> getMovieDetails(@PathVariable Long id) {
        Movie movie = movieService.getMovieById(id);
        if (movie == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    ResponseWrapper.<String>builder()
                            .status(HttpStatus.NOT_FOUND)
                            .code(404)
                            .data("Movie not found")
                            .build()
            );
        }

        MovieResponse response = MovieResponse.builder()
                .id(movie.getId())
                .title(movie.getTitle())
                .description(movie.getDescription())
                .author(movie.getAuthor())
                .actors(movie.getActors())
                .image(movie.getImage())
                .trailer(movie.getTrailer())
                .type(movie.getType())
                .duration(movie.getDuration())
                .nations(movie.getNation())
                .releaseDate(movie.getReleaseDate())
                .createdAt(movie.getCreatedAt())
                .updatedAt(movie.getUpdatedAt())
                .genreNames(movie.getGenres() != null ?
                        movie.getGenres().stream().map(Genre::getGenreName).collect(Collectors.toSet()) :
                        Set.of())
                .build();

        return ResponseEntity.status(HttpStatus.OK).body(
                ResponseWrapper.<MovieResponse>builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data(response)
                        .build()
        );
    }
}
