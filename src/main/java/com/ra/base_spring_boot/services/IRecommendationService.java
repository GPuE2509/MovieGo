package com.ra.base_spring_boot.services;

import com.ra.base_spring_boot.dto.resp.MovieRecommendationResp;

import java.util.List;

public interface IRecommendationService {
    List<MovieRecommendationResp> getRecommendedMovies(Long userId);
    List<MovieRecommendationResp> getDefaultRecommendations();
}
