package com.ra.base_spring_boot.repository;

import com.ra.base_spring_boot.model.TicketPrice;
import com.ra.base_spring_boot.model.constants.SeatType;
import com.ra.base_spring_boot.model.constants.MovieType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.sql.Time;
import java.util.Optional;

@Repository
public interface ITicketPriceRepository extends JpaRepository<TicketPrice, Long> {

    @Query("SELECT t FROM TicketPrice t WHERE (:typeSeat IS NULL OR t.typeSeat = :typeSeat) "
            + "AND (:typeMovie IS NULL OR t.typeMovie = :typeMovie)")
    Page<TicketPrice> findByTypeSeatAndTypeMovie(@Param("typeSeat") SeatType typeSeat,
                                                 @Param("typeMovie") MovieType typeMovie,
                                                 Pageable pageable);

    @Query("SELECT t FROM TicketPrice t "
            + "WHERE t.typeSeat = :typeSeat AND t.typeMovie = :typeMovie AND t.dayType = :dayType "
            + "AND t.startTime <= :currentTime AND (t.endTime >= :currentTime OR t.endTime IS NULL)")
    Optional<TicketPrice> findByTypeSeatAndTypeMovieAndDayType(
            @Param("typeSeat") SeatType typeSeat,
            @Param("typeMovie") MovieType typeMovie,
            @Param("dayType") boolean dayType,
            @Param("currentTime") Time currentTime);

    @Query("SELECT t FROM TicketPrice t WHERE t.typeSeat = :typeSeat AND t.typeMovie = :typeMovie " +
            "AND t.dayType = :dayType AND t.startTime <= :currentTime " +
            "AND (t.endTime >= :currentTime OR t.endTime IS NULL)")
    Optional<TicketPrice> findPrice(SeatType typeSeat, MovieType typeMovie, boolean dayType, Time currentTime);

    @Query("SELECT t FROM TicketPrice t "
            + "WHERE t.typeMovie = :typeMovie AND t.dayType = :dayType "
            + "AND :showtimeTime BETWEEN t.startTime AND t.endTime")
    Page<TicketPrice> findApplicableTicketPrices(
            @Param("typeMovie") MovieType typeMovie,
            @Param("dayType") boolean dayType,
            @Param("showtimeTime") Time showtimeTime,
            Pageable pageable);
}