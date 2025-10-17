package com.ra.base_spring_boot.services.impl;

import com.ra.base_spring_boot.dto.resp.MovieRecommendationResp;
import com.ra.base_spring_boot.model.Booking;
import com.ra.base_spring_boot.model.Genre;
import com.ra.base_spring_boot.model.Movie;
import com.ra.base_spring_boot.model.Showtime;
import com.ra.base_spring_boot.model.constants.BookingStatus;
import com.ra.base_spring_boot.repository.IBookingRepository;
import com.ra.base_spring_boot.repository.IShowtimeRepository;
import com.ra.base_spring_boot.services.IRecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class RecommendationServiceImpl implements IRecommendationService {

    @Autowired
    private IShowtimeRepository showtimeRepository;

    @Autowired
    private IBookingRepository bookingRepository;

    @Override
    public List<MovieRecommendationResp> getRecommendedMovies(Long userId) {
        List<Showtime> activeShowtimes = showtimeRepository.findByStartTimeAfter(new Date());
        Set<Long> activeMovieIds = activeShowtimes.stream()
                .map(Showtime::getMovie)
                .filter(Objects::nonNull)
                .map(Movie::getId)
                .collect(Collectors.toSet());

        List<Booking> userBookings = bookingRepository.findByUserIdAndStatus(userId, BookingStatus.COMPLETED);

        Map<Long, Long> genreCount = new HashMap<>();

        for (Booking booking : userBookings) {
            Showtime showtime = booking.getShowtime();
            if (showtime != null && showtime.getMovie() != null) {
                Movie movie = showtime.getMovie();
                if (activeMovieIds.contains(movie.getId())) {
                    for (Genre genre : movie.getGenres()) {
                        genreCount.merge(genre.getId(), 1L, Long::sum);
                    }
                }
            }
        }

        List<Long> topGenreIds = genreCount.entrySet().stream()
                .sorted(Map.Entry.<Long, Long>comparingByValue().reversed())
                .limit(10)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());

        List<MovieRecommendationResp> recommendations = new ArrayList<>();
        if (!topGenreIds.isEmpty()) {
            for (Showtime showtime : activeShowtimes) {
                Movie movie = showtime.getMovie();
                if (movie != null && movie.getGenres().stream().anyMatch(g -> topGenreIds.contains(g.getId()))) {
                    String genreNames = movie.getGenres().stream()
                            .map(Genre::getGenreName)
                            .collect(Collectors.joining(", "));
                    recommendations.add(new MovieRecommendationResp(
                            movie.getId(),
                            movie.getTitle(),
                            movie.getImage(),
                            genreNames,
                            movie.getReleaseDate()
                    ));
                }
            }
        } else {
            recommendations = activeShowtimes.stream()
                    .map(Showtime::getMovie)
                    .filter(Objects::nonNull)
                    .distinct()
                    .limit(10)
                    .map(movie -> new MovieRecommendationResp(
                            movie.getId(),
                            movie.getTitle(),
                            movie.getImage(),
                            movie.getGenres().stream().map(Genre::getGenreName).collect(Collectors.joining(", ")),
                            movie.getReleaseDate()
                    ))
                    .collect(Collectors.toList());
        }

        return recommendations.stream().distinct().limit(10).collect(Collectors.toList());
    }

    @Override
    public List<MovieRecommendationResp> getDefaultRecommendations() {
        List<Showtime> activeShowtimes = showtimeRepository.findByStartTimeAfter(new Date());

        return activeShowtimes.stream()
                .map(Showtime::getMovie)
                .filter(Objects::nonNull)
                .distinct()
                .limit(6)
                .map(movie -> new MovieRecommendationResp(
                        movie.getId(),
                        movie.getTitle(),
                        movie.getImage(),
                        movie.getGenres().stream().map(Genre::getGenreName).collect(Collectors.joining(", ")),
                        movie.getReleaseDate()
                ))
                .collect(Collectors.toList());
    }

}