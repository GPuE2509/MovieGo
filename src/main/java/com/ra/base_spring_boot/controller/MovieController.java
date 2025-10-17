package com.ra.base_spring_boot.controller;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.ra.base_spring_boot.dto.ResponseWrapper;
import com.ra.base_spring_boot.dto.req.FormMovie;
import com.ra.base_spring_boot.dto.req.FormUpdateMovie;
import com.ra.base_spring_boot.dto.resp.MovieResponse;
import com.ra.base_spring_boot.model.Genre;
import com.ra.base_spring_boot.model.Movie;
import com.ra.base_spring_boot.services.IGenreService;
import com.ra.base_spring_boot.services.IMovieService;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/")
@RequiredArgsConstructor
@Tag(name = "Movie Management", description = "APIs for managing movies (Admin only)")
public class MovieController {
    
    @Autowired
    private final IMovieService movieService;
    @Autowired
    private final IGenreService genreService;
    @Autowired
    private final Cloudinary cloudinary;

    @Operation(summary = "Get all movies", description = "Retrieve a paginated list of movies with optional filters")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successful retrieval",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class))),
            @ApiResponse(responseCode = "400", description = "Invalid pagination parameters"),
            @ApiResponse(responseCode = "403", description = "Unauthorized access")
    })
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/admin/movies")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> getAllMovies(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String author,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Movie> movies = movieService.getAllMovies(title, author, sortBy, pageable);
        Page<MovieResponse> response = movies.map(movie -> MovieResponse.builder()
                .id(movie.getId())
                .title(movie.getTitle())
                .description(movie.getDescription())
                .author(movie.getAuthor())
                .image(movie.getImage())
                .trailer(movie.getTrailer())
                .actors(movie.getActors())
                .nations(movie.getNation())
                .type(movie.getType())
                .duration(movie.getDuration())
                .releaseDate(movie.getReleaseDate())
                .createdAt(movie.getCreatedAt())
                .updatedAt(movie.getUpdatedAt())
                .genreNames(movie.getGenres().stream().map(Genre::getGenreName).collect(Collectors.toSet()))
                .build());
        return ResponseEntity.status(HttpStatus.OK).body(
                ResponseWrapper.<Page<MovieResponse>>builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data(response)
                        .build()
        );
    }

    @Operation(summary = "Get movie by ID", description = "Retrieve a specific movie by its ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successful retrieval",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class))),
            @ApiResponse(responseCode = "404", description = "Movie not found"),
            @ApiResponse(responseCode = "403", description = "Unauthorized access")
    })
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/admin/movie/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> getMovieById(@PathVariable Long id) {
        Movie movie = movieService.getMovieById(id);
        MovieResponse response = MovieResponse.builder()
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
                .genreNames(movie.getGenres().stream().map(Genre::getGenreName).collect(Collectors.toSet()))
                .build();
        return ResponseEntity.status(HttpStatus.OK).body(
                ResponseWrapper.<MovieResponse>builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data(response)
                        .build()
        );
    }

    @Operation(summary = "Add a new movie", description = "Create a new movie with optional image upload to Cloudinary")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Movie created successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input data"),
            @ApiResponse(responseCode = "403", description = "Unauthorized access"),
            @ApiResponse(responseCode = "500", description = "Error uploading image to Cloudinary")
    })
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping(value = "/admin/movie/create", consumes = {"multipart/form-data"})
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> addMovie(@Valid @ModelAttribute FormMovie formMovie) {
        try {
            String imageUrl = null;
            if (formMovie.getImage() != null && !formMovie.getImage().isEmpty()) {
                Map uploadResult = cloudinary.uploader().upload(formMovie.getImage().getBytes(),
                        ObjectUtils.asMap("resource_type", "image"));
                imageUrl = (String) uploadResult.get("secure_url");
            }

            Movie movie = Movie.builder()
                    .title(formMovie.getTitle())
                    .description(formMovie.getDescription())
                    .author(formMovie.getAuthor())
                    .image(imageUrl)
                    .trailer(formMovie.getTrailer())
                    .type(formMovie.getType())
                    .duration(formMovie.getDuration())
                    .releaseDate(formMovie.getReleaseDate())
                    .actors(formMovie.getActors())
                    .nation(formMovie.getNation())
                    .genres(new HashSet<>())
                    .build();

            Movie savedMovie = movieService.addMovie(movie);

            if (formMovie.getGenreIds() != null && !formMovie.getGenreIds().isEmpty()) {
                Set<Genre> genres = genreService.findAllByIds(formMovie.getGenreIds());
                movie.setGenres(genres);
                savedMovie = movieService.addMovie(movie); // Update movie with genres
            }

            MovieResponse response = MovieResponse.builder()
                    .id(savedMovie.getId())
                    .title(savedMovie.getTitle())
                    .description(savedMovie.getDescription())
                    .author(savedMovie.getAuthor())
                    .image(savedMovie.getImage())
                    .trailer(savedMovie.getTrailer())
                    .nations(savedMovie.getNation())
                    .actors(savedMovie.getActors())
                    .type(savedMovie.getType())
                    .duration(savedMovie.getDuration())
                    .releaseDate(savedMovie.getReleaseDate())
                    .createdAt(savedMovie.getCreatedAt())
                    .updatedAt(savedMovie.getUpdatedAt())
                    .genreNames(savedMovie.getGenres() != null ?
                            savedMovie.getGenres().stream()
                                    .map(Genre::getGenreName)
                                    .collect(Collectors.toSet()) :
                            new HashSet<>())
                    .build();

            return ResponseEntity.status(HttpStatus.CREATED).body(
                    ResponseWrapper.<MovieResponse>builder()
                            .status(HttpStatus.CREATED)
                            .code(201)
                            .data(response)
                            .build()
            );
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    ResponseWrapper.builder()
                            .status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .code(500)
                            .data("Error uploading image to Cloudinary")
                            .build()
            );
        }
    }

    @Operation(summary = "Update movie details", description = "Update movie information (excluding image)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Movie updated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input data"),
            @ApiResponse(responseCode = "404", description = "Movie not found")
    })
    @SecurityRequirement(name = "bearerAuth")
    @PutMapping("/admin/movie/update/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> updateMovieDetails(
            @PathVariable Long id,
            @Valid @RequestBody FormUpdateMovie updateRequest) {

        Movie existingMovie = movieService.getMovieById(id);

        existingMovie.setTitle(updateRequest.getTitle());
        existingMovie.setDescription(updateRequest.getDescription());
        existingMovie.setAuthor(updateRequest.getAuthor());
        existingMovie.setTrailer(updateRequest.getTrailer());
        existingMovie.setType(updateRequest.getType());
        existingMovie.setDuration(updateRequest.getDuration());
        existingMovie.setReleaseDate(updateRequest.getReleaseDate());

        if (updateRequest.getGenreIds() != null && !updateRequest.getGenreIds().isEmpty()) {
            Set<Genre> genres = genreService.findAllByIds(updateRequest.getGenreIds());
            existingMovie.setGenres(genres);
        }

        Movie updatedMovie = movieService.updateMovie(id, existingMovie);

        MovieResponse response = MovieResponse.builder()
                .id(updatedMovie.getId())
                .title(updatedMovie.getTitle())
                .description(updatedMovie.getDescription())
                .author(updatedMovie.getAuthor())
                .image(updatedMovie.getImage())
                .trailer(updatedMovie.getTrailer())
                .type(updatedMovie.getType())
                .duration(updatedMovie.getDuration())
                .releaseDate(updatedMovie.getReleaseDate())
                .createdAt(updatedMovie.getCreatedAt())
                .updatedAt(updatedMovie.getUpdatedAt())
                .genreNames(updatedMovie.getGenres() != null ?
                        updatedMovie.getGenres().stream()
                                .map(Genre::getGenreName)
                                .collect(Collectors.toSet()) : new HashSet<>())
                .build();

        return ResponseEntity.status(HttpStatus.OK).body(
                ResponseWrapper.<MovieResponse>builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data(response)
                        .build()
        );
    }

    @Operation(summary = "Update movie image", description = "Update movie image separately")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Image updated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid image file"),
            @ApiResponse(responseCode = "404", description = "Movie not found")
    })
    @SecurityRequirement(name = "bearerAuth")
    @PatchMapping(value = "/admin/movie/update/image/{id}", consumes = {"multipart/form-data"})
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> updateMovieImage(
            @PathVariable Long id,
            @RequestParam("image") MultipartFile imageFile) {

        if (imageFile.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    ResponseWrapper.<String>builder()
                            .status(HttpStatus.BAD_REQUEST)
                            .code(400)
                            .data("Image file cannot be empty")
                            .build()
            );
        }

        try {
            // Upload to Cloudinary
            Map uploadResult = cloudinary.uploader().upload(imageFile.getBytes(), ObjectUtils.asMap(
                    "resource_type", "image",
                    "public_id", "movies/" + id + "/" + imageFile.getOriginalFilename().replaceAll("\\s+", "_")
            ));
            String imageUrl = (String) uploadResult.get("secure_url"); // Get Cloudinary URL

            // Update movie with Cloudinary URL
            Movie existingMovie = movieService.getMovieById(id);
            existingMovie.setImage(imageUrl);
            Movie updatedMovie = movieService.updateMovie(id, existingMovie);

            MovieResponse response = MovieResponse.builder()
                    .id(updatedMovie.getId())
                    .title(updatedMovie.getTitle())
                    .description(updatedMovie.getDescription())
                    .author(updatedMovie.getAuthor())
                    .image(updatedMovie.getImage()) // Now a Cloudinary URL
                    .trailer(updatedMovie.getTrailer())
                    .type(updatedMovie.getType())
                    .duration(updatedMovie.getDuration())
                    .releaseDate(updatedMovie.getReleaseDate())
                    .createdAt(updatedMovie.getCreatedAt())
                    .updatedAt(updatedMovie.getUpdatedAt())
                    .genreNames(updatedMovie.getGenres() != null ?
                            updatedMovie.getGenres().stream()
                                    .map(Genre::getGenreName)
                                    .collect(Collectors.toSet()) : new HashSet<>())
                    .build();

            return ResponseEntity.status(HttpStatus.OK).body(
                    ResponseWrapper.<MovieResponse>builder()
                            .status(HttpStatus.OK)
                            .code(200)
                            .data(response)
                            .build()
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    ResponseWrapper.<String>builder()
                            .status(HttpStatus.BAD_REQUEST)
                            .code(400)
                            .data("Failed to upload image: " + e.getMessage())
                            .build()
            );
        }
    }

    @Operation(summary = "Delete a movie", description = "Delete a movie by ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Movie deleted successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class))),
            @ApiResponse(responseCode = "404", description = "Movie not found"),
            @ApiResponse(responseCode = "403", description = "Unauthorized access")
    })
    @SecurityRequirement(name = "bearerAuth")
    @DeleteMapping("/admin/movie/delete/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> deleteMovie(@PathVariable Long id) {
        movieService.deleteMovie(id);
        return ResponseEntity.status(HttpStatus.OK).body(
                ResponseWrapper.<String>builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data("Movie deleted successfully")
                        .build()
        );
    }
}