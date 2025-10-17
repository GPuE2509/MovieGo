package com.ra.base_spring_boot.controller;

import com.ra.base_spring_boot.dto.ResponseWrapper;
import com.ra.base_spring_boot.dto.req.FormScreen;
import com.ra.base_spring_boot.dto.resp.PageResponse;
import com.ra.base_spring_boot.dto.resp.ScreenResp;
import com.ra.base_spring_boot.model.Screen;
import com.ra.base_spring_boot.services.IScreenService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/screen")
@RequiredArgsConstructor
@Tag(name = "Screen Management", description = "APIs for managing screens (Admin only)")
public class ScreenController {

    @Autowired
    private IScreenService screenService;

    @Operation(summary = "Get all screens", description = "Retrieve a paginated list of screens with optional search (Admin only)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successful retrieval",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class))),
            @ApiResponse(responseCode = "400", description = "Invalid pagination parameters"),
            @ApiResponse(responseCode = "403", description = "Unauthorized access")
    })
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> getAllScreens(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(defaultValue = "name") String sortField,
            @RequestParam(defaultValue = "asc") String sortOrder,
            @RequestParam(defaultValue = "") String search) {
        PageResponse<ScreenResp> screenResponse = screenService.getAllScreens(page, pageSize, sortField, sortOrder, search);
        return ResponseEntity.status(HttpStatus.OK).body(
                ResponseWrapper.builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data(screenResponse)
                        .build()
        );
    }

    @Operation(summary = "Add a new screen", description = "Create a new screen (Admin only)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Screen created successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input data"),
            @ApiResponse(responseCode = "403", description = "Unauthorized access")
    })
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping("/create")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> addScreen(@Valid @RequestBody FormScreen formScreen) {
        try {
            screenService.createScreen(formScreen);
            return ResponseEntity.status(HttpStatus.CREATED).body(
                    ResponseWrapper.builder()
                            .status(HttpStatus.CREATED)
                            .code(201)
                            .data("Screen created successfully")
                            .build()
            );
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    ResponseWrapper.builder()
                            .status(HttpStatus.BAD_REQUEST)
                            .code(400)
                            .data(e.getMessage())
                            .build()
            );
        }
    }

    @Operation(summary = "Get screens by theater ID", description = "Retrieve screens by theater ID (Admin only)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Screens retrieved successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class))),
            @ApiResponse(responseCode = "400", description = "Invalid theater ID"),
            @ApiResponse(responseCode = "403", description = "Unauthorized access"),
            @ApiResponse(responseCode = "404", description = "Theater not found")
    })
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/get-screen-by-theater-id/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> getScreenByTheaterId(@PathVariable @Min(1) Long id) {
        try {
            List<Screen> screens = screenService.getScreenByTheaterId(id);
            return ResponseEntity.status(HttpStatus.OK).body(
                    ResponseWrapper.builder()
                            .status(HttpStatus.OK)
                            .code(200)
                            .data(screens)
                            .build()
            );
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    ResponseWrapper.builder()
                            .status(HttpStatus.NOT_FOUND)
                            .code(404)
                            .data(e.getMessage())
                            .build()
            );
        }
    }

    @Operation(summary = "Update a screen", description = "Update an existing screen by ID (Admin only)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Screen updated successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input data"),
            @ApiResponse(responseCode = "403", description = "Unauthorized access"),
            @ApiResponse(responseCode = "404", description = "Screen not found")
    })
    @SecurityRequirement(name = "bearerAuth")
    @PutMapping("/update/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> updateScreen(@PathVariable @Min(1) Long id, @Valid @RequestBody FormScreen formScreen) {
        try {
            screenService.updateScreen(id, formScreen);
            return ResponseEntity.status(HttpStatus.OK).body(
                    ResponseWrapper.builder()
                            .status(HttpStatus.OK)
                            .code(200)
                            .data("Screen updated successfully")
                            .build()
            );
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    ResponseWrapper.builder()
                            .status(HttpStatus.BAD_REQUEST)
                            .code(400)
                            .data(e.getMessage())
                            .build()
            );
        }
    }

    @Operation(summary = "Delete a screen", description = "Delete a screen by ID (Admin only)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Screen deleted successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class))),
            @ApiResponse(responseCode = "403", description = "Unauthorized access"),
            @ApiResponse(responseCode = "404", description = "Screen not found")
    })
    @SecurityRequirement(name = "bearerAuth")
    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> deleteScreen(@PathVariable @Min(1) Long id) {
        try {
            screenService.deleteScreen(id);
            return ResponseEntity.status(HttpStatus.NO_CONTENT).body(
                    ResponseWrapper.builder()
                            .status(HttpStatus.NO_CONTENT)
                            .code(204)
                            .data("Screen deleted successfully")
                            .build()
            );
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    ResponseWrapper.builder()
                            .status(HttpStatus.NOT_FOUND)
                            .code(404)
                            .data(e.getMessage())
                            .build()
            );
        }
    }
    @Operation(summary = "Suggest max columns", description = "Suggest the number of columns based on seat capacity and max rows (Admin only)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Suggested columns retrieved successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input data"),
            @ApiResponse(responseCode = "403", description = "Unauthorized access")
    })
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/suggest-columns")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> suggestColumns(
            @RequestParam @Min(value = 50, message = "Seat capacity must be at least 50") int seatCapacity,
            @RequestParam @Min(value = 1, message = "Max rows must be at least 1") int maxRows) {
        try {
            Map<String, Object> result = screenService.suggestMaxColumns(seatCapacity, maxRows);
            return ResponseEntity.status(HttpStatus.OK).body(
                    ResponseWrapper.builder()
                            .status(HttpStatus.OK)
                            .code(200)
                            .data(result)
                            .build()
            );
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    ResponseWrapper.builder()
                            .status(HttpStatus.BAD_REQUEST)
                            .code(400)
                            .data(e.getMessage())
                            .build()
            );
        }
    }

    @Operation(summary = "Suggest max rows", description = "Suggest the number of rows based on seat capacity and max columns (Admin only)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Suggested rows retrieved successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input data"),
            @ApiResponse(responseCode = "403", description = "Unauthorized access")
    })
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/suggest-rows")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> suggestRows(
            @RequestParam @Min(value = 50, message = "Seat capacity must be at least 50") int seatCapacity,
            @RequestParam @Min(value = 1, message = "Max columns must be at least 1") int maxColumns) {
        try {
            Map<String, Object> result = screenService.suggestMaxRows(seatCapacity, maxColumns);
            return ResponseEntity.status(HttpStatus.OK).body(
                    ResponseWrapper.builder()
                            .status(HttpStatus.OK)
                            .code(200)
                            .data(result)
                            .build()
            );
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    ResponseWrapper.builder()
                            .status(HttpStatus.BAD_REQUEST)
                            .code(400)
                            .data(e.getMessage())
                            .build()
            );
        }
    }
}