package com.ra.base_spring_boot.services.impl;

import com.ra.base_spring_boot.dto.resp.*;
import com.ra.base_spring_boot.model.Genre;
import com.ra.base_spring_boot.model.Movie;
import com.ra.base_spring_boot.model.constants.MovieType;
import com.ra.base_spring_boot.repository.IBookingSeatRepository;
import com.ra.base_spring_boot.repository.IMovieRepository;
import com.ra.base_spring_boot.repository.IShowtimeRepository;
import com.ra.base_spring_boot.repository.ITheaterRepository;
import com.ra.base_spring_boot.services.IMovieService;
import jakarta.persistence.Tuple;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MovieServiceImpl implements IMovieService {
    @Autowired
    private final IMovieRepository movieRepository;
    @Autowired
    private final IShowtimeRepository showtimeRepository;
    @Autowired
    private final ITheaterRepository theaterRepository;
    @Autowired
    private final IBookingSeatRepository bookingSeatRepository;

    private static final Logger log = LoggerFactory.getLogger(MovieServiceImpl.class);

    @Override
    public Page<Movie> getAllMovies(String title, String author, String sortBy, Pageable pageable) {
        return movieRepository.findByTitleOrAuthor(title, author, pageable);
    }

    @Override
    public Movie getMovieById(Long id) {
        return movieRepository.findMovieById(id);
    }

    @Override
    public Movie addMovie(Movie movie) {
        movie.setCreatedAt(new Date());
        movie.setUpdatedAt(new Date());
        return movieRepository.save(movie);
    }

    @Override
    public Movie updateMovie(Long id, Movie movie) {
        Movie existingMovie = movieRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Movie not found"));
        existingMovie.setTitle(movie.getTitle());
        existingMovie.setDescription(movie.getDescription());
        existingMovie.setAuthor(movie.getAuthor());
        existingMovie.setImage(movie.getImage());
        existingMovie.setTrailer(movie.getTrailer());
        existingMovie.setType(movie.getType());
        existingMovie.setDuration(movie.getDuration());
        existingMovie.setReleaseDate(movie.getReleaseDate());
        existingMovie.setGenres(movie.getGenres());
        existingMovie.setUpdatedAt(new Date());
        return movieRepository.save(existingMovie);
    }

    @Override
    public void deleteMovie(Long id) {
        movieRepository.deleteById(id);
    }

    @Override
    public Page<Movie> getMoviesWithActiveShowtimes(Date date, Long theaterId, Pageable pageable) {
        Date queryDate = (date != null) ? date : new Date();
        if (theaterId != null) {
            return movieRepository.findMoviesWithActiveShowtimesByTheater(queryDate, theaterId, pageable);
        }
        return movieRepository.findMoviesWithActiveShowtimes(queryDate, pageable);
    }

    @Override
    @CacheEvict(value = "seatStatus", allEntries = true)
    public Page<Movie> findByReleaseDateAfter(Date date, Pageable pageable) {
        return movieRepository.findByReleaseDateAfter(date, pageable);
    }

    @Override
    public List<MovieResponse> getAllMoviesShowing(Date now) {
        LocalDate today = now.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
        LocalDate endOfWeek = today.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));

        Date fromDate = Date.from(today.atStartOfDay(ZoneId.systemDefault()).toInstant());
        Date toDate = Date.from(endOfWeek.atTime(23, 59, 59, 999_999_999).atZone(ZoneId.systemDefault()).toInstant());

        List<Movie> movies = showtimeRepository.findMoviesWithShowtimesBetweenDates(fromDate, toDate).stream()
                .filter(movie -> movie.getReleaseDate() != null && !movie.getReleaseDate().after(now))
                .collect(Collectors.toList());

        return convertToMovieResponseList(movies);
    }

    @Override
    public List<MovieResponse> getAllMoviesComing(Date now) {
        Pageable pageable = PageRequest.of(0, Integer.MAX_VALUE);
        Page<Movie> movies = movieRepository.findByReleaseDateAfter(now, pageable);
        return convertToMovieResponseList(movies.getContent());
    }

    @Override
    public Optional<Movie> getMovieDetail(Long id) {
        return movieRepository.findById(id);
    }

    @Override
    public Optional<String> getMovieTrailer(Long id) {
        return movieRepository.findById(id).map(Movie::getTrailer);
    }

    @Override
    public List<TheaterDTO> getTheatersNear(double lat, double lon, double radiusKm, LocalDate date, int limit) {
        LocalDateTime start = date.atStartOfDay(ZoneId.of("Asia/Ho_Chi_Minh")).toLocalDateTime();
        LocalDateTime end = date.atTime(23, 59, 59).atZone(ZoneId.of("Asia/Ho_Chi_Minh")).toLocalDateTime();
        log.info("Fetching theaters with showtimes for date range: {} to {}", start, end);

        List<Tuple> theaters = theaterRepository.findTheatersWithShowtimesInDateRange(start, end);
        log.info("Total theaters retrieved: {}", theaters.size());

        List<TheaterDTO> filteredTheaters = theaters.stream()
                .map(tuple -> {
                    Double latitude = tuple.get("latitude", Double.class);
                    Double longitude = tuple.get("longitude", Double.class);
                    if (latitude == null || longitude == null) return null;
                    double distance = distance(lat, lon, latitude, longitude);
                    return TheaterDTO.builder()
                            .id(tuple.get("id", Long.class))
                            .name(tuple.get("name", String.class))
                            .state(tuple.get("state", String.class))
                            .location(tuple.get("location", String.class))
                            .phone(tuple.get("phone", String.class))
                            .imageUrl(tuple.get("imageUrl", String.class))
                            .latitude(latitude)
                            .longitude(longitude)
                            .distance(distance)
                            .build();
                })
                .filter(dto -> dto != null && dto.getDistance() <= radiusKm)
                .sorted(Comparator.comparingDouble(TheaterDTO::getDistance))
                .limit(limit)
                .collect(Collectors.toList());

        log.info("Filtered theaters within {} km: {}", radiusKm, filteredTheaters.size());
        return filteredTheaters;
    }

    private double distance(double lat1, double lon1, double lat2, double lon2) {
        double earthRadius = 6371.0;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        double distanceKm = earthRadius * c;
        return Math.round(distanceKm * 100.0) / 100.0;
    }

    private MovieResponse convertToMovieResponse(Movie movie) {
        if (movie == null) {
            throw new IllegalArgumentException("Movie cannot be null");
        }

        return MovieResponse.builder()
                .id(movie.getId())
                .title(movie.getTitle())
                .description(movie.getDescription())
                .author(movie.getAuthor())
                .image(movie.getImage())
                .actors(movie.getActors() != null ? movie.getActors() : Collections.emptyList().toString())
                .trailer(movie.getTrailer())
                .type(movie.getType())
                .duration(movie.getDuration())
                .nations(movie.getNation() != null ? movie.getNation() : Collections.emptyList().toString())
                .releaseDate(movie.getReleaseDate())
                .createdAt(movie.getCreatedAt())
                .updatedAt(movie.getUpdatedAt())
                .genreNames(movie.getGenres() != null ?
                        movie.getGenres().stream()
                                .filter(genre -> genre != null && genre.getGenreName() != null)
                                .map(Genre::getGenreName)
                                .collect(Collectors.toSet()) :
                        new HashSet<>())
                .build();
    }

    private List<MovieResponse> convertToMovieResponseList(List<Movie> movies) {
        return movies.stream()
                .map(this::convertToMovieResponse)
                .collect(Collectors.toList());
    }


    private Date convertToDate(LocalDate localDate) {
        if (localDate == null) return null;
        return Date.from(localDate.atStartOfDay(ZoneId.systemDefault()).toInstant());
    }

    private Date convertToDate(LocalDateTime localDateTime) {
        if (localDateTime == null) return null;
        return Date.from(localDateTime.atZone(ZoneId.systemDefault()).toInstant());
    }
}