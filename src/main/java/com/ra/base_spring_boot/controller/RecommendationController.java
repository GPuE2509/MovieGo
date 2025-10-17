package com.ra.base_spring_boot.controller;

import com.ra.base_spring_boot.dto.ResponseWrapper;
import com.ra.base_spring_boot.dto.resp.MovieRecommendationResp;
import com.ra.base_spring_boot.security.principle.MyUserDetails;
import com.ra.base_spring_boot.services.IRecommendationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@Tag(name = "Recommendations", description = "APIs for personalized movie recommendations")
public class RecommendationController {

    @Autowired
    private IRecommendationService recommendationService;

    @Operation(summary = "Get recommended movies", description = "Retrieve personalized or default movie recommendations")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successful retrieval of recommendations"),
            @ApiResponse(responseCode = "500", description = "Server error")
    })
    @GetMapping("/recommendations")
    public ResponseEntity<?> getRecommendedMovies(Authentication authentication) {
        try {
            List<MovieRecommendationResp> recommendations;

            if (authentication != null && authentication.isAuthenticated()
                    && authentication.getPrincipal() instanceof MyUserDetails userDetails) {
                Long userId = userDetails.getUser().getId();
                recommendations = recommendationService.getRecommendedMovies(userId);
            } else {
                recommendations = recommendationService.getDefaultRecommendations();
            }

            return ResponseEntity.status(HttpStatus.OK).body(
                    ResponseWrapper.builder()
                            .status(HttpStatus.OK)
                            .code(200)
                            .data(recommendations)
                            .build()
            );

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    ResponseWrapper.builder()
                            .status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .code(500)
                            .data("Server error: " + e.getMessage())
                            .build()
            );
        }
    }
}