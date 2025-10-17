package com.ra.base_spring_boot.controller;

import com.ra.base_spring_boot.dto.ResponseWrapper;
import com.ra.base_spring_boot.dto.resp.FestivalResponse;
import com.ra.base_spring_boot.dto.resp.NewResponse;
import com.ra.base_spring_boot.dto.resp.PromotionResp;
import com.ra.base_spring_boot.services.IFestivalService;
import com.ra.base_spring_boot.services.INewsService;
import com.ra.base_spring_boot.services.IPromotionService;
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
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/")
@RequiredArgsConstructor
@Tag(name = "Sidebar Management", description = "Public APIs for managing sidebar content")
public class SidebarController {

    @Autowired
    private IPromotionService promotionService;

    @Autowired
    private INewsService newsService;

    @Autowired
    private IFestivalService festivalService;

    @Operation(summary = "Get promotions for carousel", description = "Retrieve a list of promotions for the carousel (max 9 items)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successful retrieval",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class))),
            @ApiResponse(responseCode = "400", description = "Invalid request")
    })
    @GetMapping("/promotions/carousel")
    public ResponseEntity<?> getPromotionsForCarousel() {
        List<PromotionResp> promotions = promotionService.getPromotionsForCarousel();
        return ResponseEntity.ok().body(
                ResponseWrapper.builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data(promotions)
                        .build()
        );
    }

    @Operation(summary = "Get news for carousel", description = "Retrieve a list of news for the carousel (max 9 items)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successful retrieval",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class))),
            @ApiResponse(responseCode = "400", description = "Invalid request")
    })
    @GetMapping("/news/carousel")
    public ResponseEntity<?> getNewsForCarousel() {
        List<NewResponse> news = newsService.getNewsForCarousel();
        return ResponseEntity.ok().body(
                ResponseWrapper.builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data(news)
                        .build()
        );
    }

    @Operation(summary = "Get top festivals", description = "Retrieve a list of top 3 festivals")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successful retrieval",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class))),
            @ApiResponse(responseCode = "400", description = "Invalid request")
    })
    @GetMapping("/festivals/top")
    public ResponseEntity<?> getTopFestivals() {
        List<FestivalResponse> festivals = festivalService.getTopFestivals();
        return ResponseEntity.ok().body(
                ResponseWrapper.builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data(festivals)
                        .build()
        );
    }
}