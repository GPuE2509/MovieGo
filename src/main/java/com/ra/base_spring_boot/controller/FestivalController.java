package com.ra.base_spring_boot.controller;

import com.ra.base_spring_boot.dto.ResponseWrapper;
import com.ra.base_spring_boot.dto.req.FormFestival;
import com.ra.base_spring_boot.dto.req.FormImageFestival;
import com.ra.base_spring_boot.dto.resp.FestivalResponse;
import com.ra.base_spring_boot.dto.resp.ImageFestivalResponse;
import com.ra.base_spring_boot.dto.resp.PageResponse;
import com.ra.base_spring_boot.model.Festival;
import com.ra.base_spring_boot.services.IFestivalService;
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

@RestController
@RequestMapping("/api/v1/admin/")
@RequiredArgsConstructor
@Tag(name = "Festival Management", description = "APIs for managing festivals (Admin only)")
public class FestivalController {
    
    @Autowired
    private IFestivalService festivalService;

    @Operation(summary = "Get all festivals", description = "Retrieve a paginated list of festivals with optional search")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successful retrieval",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class))),
            @ApiResponse(responseCode = "400", description = "Invalid pagination parameters"),
            @ApiResponse(responseCode = "403", description = "Unauthorized access")
    })
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/festivals")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> getAllFestivals(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(defaultValue = "name") String sortField,
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

    @Operation(summary = "Add a new festival", description = "Create a new festival")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Festival created successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input data"),
            @ApiResponse(responseCode = "403", description = "Unauthorized access")
    })
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping("festival/create")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> addFestival(@Valid @ModelAttribute FormFestival formFestival) {
        festivalService.createFestival(formFestival);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ResponseWrapper.builder()
                        .status(HttpStatus.CREATED)
                        .code(201)
                        .data("Festival created successfully")
                        .build()
        );
    }

    @Operation(summary = "Update a festival", description = "Update an existing festival by ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Festival updated successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input data"),
            @ApiResponse(responseCode = "403", description = "Unauthorized access"),
            @ApiResponse(responseCode = "404", description = "Festival not found")
    })
    @SecurityRequirement(name = "bearerAuth")
    @PutMapping("festival/update/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> updateFestival(@Valid @PathVariable Long id, @ModelAttribute FormFestival formFestival) {
        festivalService.updateFestival(id, formFestival);
        return ResponseEntity.ok().body(
                ResponseWrapper.builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data("Festival updated successfully")
                        .build()
        );
    }
    @PutMapping("user/update-festival-image/{id}")
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?>updateImageFestival(@PathVariable Long id, @ModelAttribute FormImageFestival imageFestival) {
        festivalService.updateImageFestival(id, imageFestival);
        Festival festival = festivalService.getFestivalById(id);
        ImageFestivalResponse imageFestivalResponse = ImageFestivalResponse.builder()
                .image(festival.getImage())
                .build();
        return ResponseEntity.status(HttpStatus.OK).body(
                ResponseWrapper.<ImageFestivalResponse>builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data(imageFestivalResponse)
                        .build()
        );
    }
    @Operation(summary = "Delete a festival", description = "Delete a festival by ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Festival deleted successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class))),
            @ApiResponse(responseCode = "404", description = "Festival not found"),
            @ApiResponse(responseCode = "403", description = "Unauthorized access")
    })
    @SecurityRequirement(name = "bearerAuth")
    @DeleteMapping("festival/delete/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> deleteFestival(@PathVariable Long id) {
        festivalService.deleteFestival(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).body(
                ResponseWrapper.builder()
                        .status(HttpStatus.NO_CONTENT)
                        .code(204)
                        .data("Festival deleted successfully")
                        .build()
        );

    }
}
