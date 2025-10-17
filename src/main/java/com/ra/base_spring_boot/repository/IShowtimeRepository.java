package com.ra.base_spring_boot.repository;

import com.ra.base_spring_boot.model.Showtime;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.ra.base_spring_boot.model.Movie;

import java.util.Date;
import java.util.List;

@Repository
public interface IShowtimeRepository extends JpaRepository<Showtime, Long> {
    @Query("SELECT s FROM Showtime s WHERE s.movie.id = :movieId AND s.screen.deleted = false AND s.screen.theater.deleted = false ORDER BY s.startTime ASC")
    Page<Showtime> findByMovieId(@Param("movieId") Long movieId, Pageable pageable);

    @Query("SELECT s FROM Showtime s WHERE s.movie.id = :movieId AND s.screen.deleted = false AND s.screen.theater.deleted = false " +
            "AND (:theaterId IS NULL OR s.screen.theater.id = :theaterId) " +
            "AND (:date IS NULL OR DATE(s.startTime) = :date) ORDER BY s.startTime ASC")
    Page<Showtime> findByMovieIdAndTheaterAndDate(@Param("movieId") Long movieId, @Param("theaterId") Long theaterId,
                                                  @Param("date") Date date, Pageable pageable);

    @Query("SELECT s FROM Showtime s WHERE s.startTime BETWEEN :fromDate AND :toDate AND s.screen.deleted = false AND s.screen.theater.deleted = false ORDER BY s.startTime ASC")
    List<Showtime> findShowtimesBetweenDates(@Param("fromDate") Date fromDate, @Param("toDate") Date toDate);

    @Query("SELECT DISTINCT s.movie FROM Showtime s WHERE s.startTime BETWEEN :fromDate AND :toDate AND s.screen.deleted = false AND s.screen.theater.deleted = false")
    List<Movie> findMoviesWithShowtimesBetweenDates(@Param("fromDate") Date fromDate, @Param("toDate") Date toDate);

    @Query("SELECT s FROM Showtime s WHERE s.startTime > :startTime AND s.screen.deleted = false AND s.screen.theater.deleted = false")
    List<Showtime> findByStartTimeAfter(Date startTime);

    @Query("SELECT s FROM Showtime s " +
            "WHERE s.movie.id = :movieId " +
            "AND s.screen.theater.id = :theaterId " +
            "AND s.startTime >= :startOfDay " +
            "AND s.startTime < :endOfDay " +
            "AND s.screen.deleted = false " +
            "AND s.screen.theater.deleted = false " +
            "ORDER BY s.startTime")
    List<Showtime> findByMovieIdAndTheaterAndDate(
            @Param("movieId") Long movieId,
            @Param("theaterId") Long theaterId,
            @Param("startOfDay") Date startOfDay,
            @Param("endOfDay") Date endOfDay
    );

    @Query("SELECT s FROM Showtime s " +
            "WHERE s.movie.id = :movieId " +
            "AND s.screen.id = :screenId " +
            "AND s.screen.deleted = false " +
            "AND s.screen.theater.deleted = false " +
            "ORDER BY s.startTime ASC")
    Page<Showtime> findByMovieIdAndScreenId(@Param("movieId") Long movieId, @Param("screenId") Long screenId, Pageable pageable);

    List<Showtime> findByScreenId(@NotNull(message = "Screen ID is required") Long screenId);
}