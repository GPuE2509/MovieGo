package com.ra.base_spring_boot.repository;

import com.ra.base_spring_boot.model.Theater;
import jakarta.persistence.Tuple;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ITheaterRepository extends JpaRepository<Theater, Long> {
    @Query("SELECT t FROM Theater t WHERE " +
            "(:keyword IS NULL OR t.name LIKE %:keyword% OR t.location LIKE %:keyword%) AND t.deleted = false")
    Page<Theater> findByKeyword(@Param("keyword") String keyword, Pageable pageable);

    Optional<Theater> findTheaterByIdAndDeleted(Long id, boolean deleted);

    boolean existsByNameAndDeleted(String name, boolean deleted);

    @Query("""
                    SELECT DISTINCT
                        t.id AS id,
                        t.name AS name,
                        t.state AS state,
                        t.location AS location,
                        t.phone AS phone,
                        t.latitude AS latitude,
                        t.longitude AS longitude,
                        t.image AS imageUrl
                    FROM Theater t
                    JOIN Screen sc ON t.id = sc.theater.id
                    JOIN Showtime s ON sc.id = s.screen.id
                    WHERE s.startTime BETWEEN :start AND :end
                    AND t.deleted = false
            """)
    List<Tuple> findTheatersWithShowtimesInDateRange(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

}
