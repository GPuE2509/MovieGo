package com.ra.base_spring_boot.repository;

import com.ra.base_spring_boot.dto.resp.RevenueDto;
import com.ra.base_spring_boot.model.Movie;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;


import java.util.Date;
import java.util.List;

@Repository
public interface IMovieRepository extends JpaRepository<Movie, Long> {
    @Query("SELECT m FROM Movie m WHERE (:title IS NULL OR m.title LIKE %:title%) " +
            "OR (:author IS NULL OR m.author LIKE %:author%)")
    Page<Movie> findByTitleOrAuthor(@Param("title") String title, @Param("author") String author, Pageable pageable);

    @Query("SELECT DISTINCT m FROM Showtime s JOIN s.movie m WHERE s.startTime >= :date AND s.endTime > CURRENT_TIMESTAMP")
    Page<Movie> findMoviesWithActiveShowtimes(@Param("date") Date date, Pageable pageable);

    @Query("SELECT DISTINCT m FROM Showtime s JOIN s.movie m JOIN s.screen scr JOIN scr.theater t " +
            "WHERE s.startTime >= :date AND s.endTime > CURRENT_TIMESTAMP AND t.id = :theaterId")
    Page<Movie> findMoviesWithActiveShowtimesByTheater(@Param("date") Date date, @Param("theaterId") Long theaterId, Pageable pageable);

    Movie findMovieById(Long id);

    @Query("SELECT m FROM Movie m WHERE m.releaseDate <= :currentDate")
    List<Movie> findCurrentlyShowing(@Param("currentDate") Date currentDate);

    @Query("SELECT m FROM Movie m WHERE m.releaseDate > :currentDate")
    List<Movie> findComingSoon(@Param("currentDate") Date currentDate);

    @Query("SELECT m FROM Movie m WHERE m.releaseDate > :currentDate")
    Page<Movie> findByReleaseDateAfter(@Param("currentDate") Date currentDate, Pageable pageable);

    @Query("SELECT new com.ra.base_spring_boot.dto.resp.RevenueDto(pm.name, SUM(p.amount)) " +
            "FROM Payment p JOIN p.paymentMethod pm JOIN p.booking b " +
            "WHERE p.paymentStatus = 'COMPLETED' AND b.status = 'COMPLETED' " +
            "AND b.createdAt BETWEEN :startDate AND :endDate " +
            "GROUP BY pm.name")
    List<RevenueDto> sumRevenueByPaymentMethod(@Param("startDate") Date startDate, @Param("endDate") Date endDate);
}
