package com.ra.base_spring_boot.services;

import com.ra.base_spring_boot.dto.resp.MovieResponse;
import com.ra.base_spring_boot.dto.resp.TheaterDTO;
import com.ra.base_spring_boot.dto.resp.TheaterNearMeResponse;
import com.ra.base_spring_boot.model.Movie;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.Date;
import java.util.List;
import java.util.Optional;

public interface IMovieService {
    Page<Movie> getAllMovies(String title, String author, String sortBy, Pageable pageable);
    Movie getMovieById(Long id);
    Movie addMovie(Movie movie);
    Movie updateMovie(Long id, Movie movie);
    void deleteMovie(Long id);
    Page<Movie> getMoviesWithActiveShowtimes(Date date, Long theaterId, Pageable pageable);
    Page<Movie> findByReleaseDateAfter(Date date, Pageable pageable);
    List<MovieResponse> getAllMoviesShowing(Date now);
    List<MovieResponse> getAllMoviesComing(Date now);
    Optional<Movie> getMovieDetail(Long id);
    Optional<String> getMovieTrailer(Long id);
    List<TheaterDTO> getTheatersNear(double lat, double lon, double radiusKm, LocalDate date, int limit);
}
