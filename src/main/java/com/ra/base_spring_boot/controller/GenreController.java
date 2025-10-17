package com.ra.base_spring_boot.controller;

import com.ra.base_spring_boot.dto.ResponseWrapper;
import com.ra.base_spring_boot.dto.req.FormGenre;
import com.ra.base_spring_boot.dto.resp.GenreResponse;
import com.ra.base_spring_boot.model.Genre;
import com.ra.base_spring_boot.services.IGenreService;
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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/admin/")
@RequiredArgsConstructor
@Tag(name = "Genre Management", description = "APIs for managing genres (Admin only)")
public class GenreController {
    
    @Autowired
    private final IGenreService genreService;

    @Operation(summary = "Get all genres", description = "Retrieve a list of all genres")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successful retrieval",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class))),
            @ApiResponse(responseCode = "403", description = "Unauthorized access")
    })
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/genres")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> getAllGenres() {
        List<Genre> genres = genreService.getAllGenres();
        List<GenreResponse> response = genres.stream().map(genre -> GenreResponse.builder()
                .id(genre.getId())
                .genreName(genre.getGenreName())
                .build()).collect(Collectors.toList());
        return ResponseEntity.status(HttpStatus.OK).body(
                ResponseWrapper.builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data(response)
                        .build()
        );
    }

    @Operation(summary = "Add a new genre", description = "Create a new genre")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Genre created successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input data"),
            @ApiResponse(responseCode = "403", description = "Unauthorized access")
    })
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping("/genre/create")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> addGenre(@Valid @RequestBody FormGenre genreRequestDto) {
        Genre genre = Genre.builder()
                .genreName(genreRequestDto.getGenreName())
                .build();
        Genre savedGenre = genreService.addGenre(genre);
        GenreResponse response = GenreResponse.builder()
                .id(savedGenre.getId())
                .genreName(savedGenre.getGenreName())
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ResponseWrapper.builder()
                        .status(HttpStatus.CREATED)
                        .code(201)
                        .data(response)
                        .build()
        );
    }

    @Operation(summary = "Update a genre", description = "Update an existing genre by ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Genre updated successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input data"),
            @ApiResponse(responseCode = "403", description = "Unauthorized access"),
            @ApiResponse(responseCode = "404", description = "Genre not found")
    })
    @SecurityRequirement(name = "bearerAuth")
    @PutMapping("/genre/update/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> updateGenre(@Valid @PathVariable Long id, @RequestBody FormGenre genreRequestDto) {
        Genre genre = Genre.builder()
                .genreName(genreRequestDto.getGenreName())
                .build();
        Genre updatedGenre = genreService.updateGenre(id, genre);
        GenreResponse response = GenreResponse.builder()
                .id(updatedGenre.getId())
                .genreName(updatedGenre.getGenreName())
                .build();
        return ResponseEntity.status(HttpStatus.OK).body(
                ResponseWrapper.builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data(response)
                        .build()
        );
    }

    @Operation(summary = "Delete a genre", description = "Delete a genre by ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Genre deleted successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class))),
            @ApiResponse(responseCode = "404", description = "Genre not found"),
            @ApiResponse(responseCode = "403", description = "Unauthorized access")
    })
    @SecurityRequirement(name = "bearerAuth")
    @DeleteMapping("/genre/delete/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> deleteGenre(@PathVariable Long id) {
        genreService.deleteGenre(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).body(
                ResponseWrapper.builder()
                        .status(HttpStatus.NO_CONTENT)
                        .code(204)
                        .data("Genre deleted successfully")
                        .build()
        );
    }
}