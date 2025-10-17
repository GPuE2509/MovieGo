package com.ra.base_spring_boot.controller;

import com.ra.base_spring_boot.dto.ResponseWrapper;
import com.ra.base_spring_boot.dto.req.FormBanner;
import com.ra.base_spring_boot.dto.resp.BannerResponse;
import com.ra.base_spring_boot.model.Banner;
import com.ra.base_spring_boot.services.IBannerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/")
@RequiredArgsConstructor
@Tag(name = "Banner Management", description = "APIs for managing banners (Admin only)")
public class BannerController {

    @Autowired
    private final IBannerService bannerService;

    @Operation(summary = "Get all banners", description = "Retrieve a list of all banners")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successful retrieval",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class))),
    })
    @GetMapping("/get-all-banners")
    public ResponseEntity<?> getAllBanners() {
        List<Banner> banners = bannerService.getAllBanners();
        List<BannerResponse> bannerResponses = banners.stream().map(banner ->
                BannerResponse.builder()
                        .id(banner.getId())
                        .position(banner.getPosition())
                        .type(banner.getType())
                        .url(banner.getUrl())
                        .build()
        ).collect(Collectors.toList());
        return ResponseEntity.status(HttpStatus.OK).body(
                ResponseWrapper.builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data(bannerResponses)
                        .build()
        );
    }

    @Operation(summary = "Get banner by ID", description = "Retrieve a specific banner by its ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successful retrieval",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = BannerResponse.class))),
            @ApiResponse(responseCode = "404", description = "Banner not found"),
            @ApiResponse(responseCode = "403", description = "Unauthorized access")
    })
    @GetMapping("banners/{id}")
    public ResponseEntity<?> getBanner(@PathVariable Long id) {
        BannerResponse bannerResponse = bannerService.findBannerById(id);
        return ResponseEntity.status(HttpStatus.OK).body(
                ResponseWrapper.builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data(bannerResponse.getMessage())
                        .build()
        );
    }

    @Operation(summary = "Create a new banner", description = "Create a new banner")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Banner created successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = String.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input data"),
            @ApiResponse(responseCode = "403", description = "Unauthorized access")
    })
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping(value = "admin/banner/create", consumes = "multipart/form-data")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> createBanner(
            @ModelAttribute FormBanner formBanner) {
        BannerResponse bannerResponse = bannerService.createBanner(formBanner);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ResponseWrapper.builder()
                        .status(HttpStatus.CREATED)
                        .code(201)
                        .data(bannerResponse.getMessage())
                        .build()
        );
    }

    @Operation(summary = "Delete a banner", description = "Delete a banner by its ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Banner deleted successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = String.class))),
            @ApiResponse(responseCode = "404", description = "Banner not found"),
            @ApiResponse(responseCode = "403", description = "Unauthorized access")
    })
    @SecurityRequirement(name = "bearerAuth")
    @DeleteMapping("admin/banner/delete/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> deleteBanner(@PathVariable Long id) {
        BannerResponse bannerResponse = bannerService.deleteBanner(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).body(
                ResponseWrapper.builder()
                        .status(HttpStatus.NO_CONTENT)
                        .code(204)
                        .data(bannerResponse.getMessage())
                        .build()
        );
    }
}
