package com.ra.base_spring_boot.controller;

import com.ra.base_spring_boot.dto.ResponseWrapper;
import com.ra.base_spring_boot.dto.req.FormTheater;
import com.ra.base_spring_boot.dto.resp.TheaterResponse;
import com.ra.base_spring_boot.services.ITheaterService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/")
@Tag(name = "Theater Management", description = "APIs for managing theaters")
public class TheaterController {

    @Autowired
    private ITheaterService theaterService;

    @Operation(summary = "Get all theaters", description = "Retrieve a paginated list of theaters with optional search")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successful retrieval",
                content = @Content(mediaType = "application/json",
                        schema = @Schema(implementation = ResponseWrapper.class))),
        @ApiResponse(responseCode = "400", description = "Invalid pagination parameters")
    })
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("theaters")
    public ResponseEntity<?> getAllTheaters(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {
        Sort sort = Sort.by(direction.equalsIgnoreCase("asc") ? Sort.Order.asc(sortBy) : Sort.Order.desc(sortBy));
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<TheaterResponse> theaters = theaterService.findAll(keyword, pageable);
        return ResponseEntity.ok().body(
                ResponseWrapper.builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data(theaters)
                        .build()
        );
    }

    @Operation(summary = "Get theater by ID", description = "Retrieve a specific theater by its ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successful retrieval",
                content = @Content(mediaType = "application/json",
                        schema = @Schema(implementation = ResponseWrapper.class))),
        @ApiResponse(responseCode = "404", description = "Theater not found")
    })
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("theater/{id}")
    public ResponseEntity<?> getTheaterById(@PathVariable Long id) {
        FormTheater theater = theaterService.findById(id);
        return ResponseEntity.ok().body(
                ResponseWrapper.builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data(theater)
                        .build()
        );
    }

    @Operation(summary = "Create a new theater", description = "Create a new theater with image upload (Admin only)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Theater created successfully",
                content = @Content(mediaType = "application/json",
                        schema = @Schema(implementation = ResponseWrapper.class))),
        @ApiResponse(responseCode = "400", description = "Invalid input data"),
        @ApiResponse(responseCode = "403", description = "Unauthorized access")
    })
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping(value = "admin/theater/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> createTheater(
            @RequestPart("theater") @Valid FormTheater theaterDTO,
            @RequestPart("image") @Valid MultipartFile image) {
        theaterDTO.setImage(image);
        FormTheater createdTheater = theaterService.create(theaterDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ResponseWrapper.builder()
                        .status(HttpStatus.CREATED)
                        .code(201)
                        .data(createdTheater)
                        .build()
        );
    }

    @Operation(summary = "Update a theater", description = "Update an existing theater by ID with optional image upload (Admin only)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Theater updated successfully",
                content = @Content(mediaType = "application/json",
                        schema = @Schema(implementation = ResponseWrapper.class))),
        @ApiResponse(responseCode = "400", description = "Invalid input data"),
        @ApiResponse(responseCode = "403", description = "Unauthorized access"),
        @ApiResponse(responseCode = "404", description = "Theater not found")
    })
    @SecurityRequirement(name = "bearerAuth")
    @PutMapping(value = "admin/theater/update/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> updateTheater(
            @PathVariable Long id,
            @RequestPart("theater") @Valid FormTheater theaterDTO,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        theaterDTO.setImage(image);
        FormTheater updatedTheater = theaterService.update(id, theaterDTO);
        return ResponseEntity.ok().body(
                ResponseWrapper.builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data(updatedTheater)
                        .build()
        );
    }

    @Operation(summary = "Delete a theater", description = "Delete a theater by ID (Admin only)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Theater deleted successfully",
                content = @Content(mediaType = "application/json",
                        schema = @Schema(implementation = ResponseWrapper.class))),
        @ApiResponse(responseCode = "403", description = "Unauthorized access"),
        @ApiResponse(responseCode = "404", description = "Theater not found")
    })
    @SecurityRequirement(name = "bearerAuth")
    @DeleteMapping("admin/theater/delete/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> deleteTheater(@PathVariable Long id) {
        theaterService.delete(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).body(
                ResponseWrapper.builder()
                        .status(HttpStatus.NO_CONTENT)
                        .code(204)
                        .data("Theater deleted successfully")
                        .build()
        );
    }
}
