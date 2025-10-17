package com.ra.base_spring_boot.repository;

import com.ra.base_spring_boot.dto.resp.TicketCountDto;
import com.ra.base_spring_boot.model.Booking;
import com.ra.base_spring_boot.model.constants.BookingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Date;
import java.util.List;
import java.util.Optional;

public interface IBookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUserId(Long userId);

    @Query("SELECT b FROM Booking b " +
            "JOIN FETCH b.user u " +
            "JOIN FETCH b.showtime s " +
            "JOIN FETCH s.movie m " +
            "LEFT JOIN FETCH b.bookingSeats bs " +
            "LEFT JOIN FETCH bs.seat st " +
            "LEFT JOIN FETCH st.screen sc " +
            "LEFT JOIN FETCH b.payment p")
    Page<Booking> findAllWithRelations(Pageable pageable);

    @Query("SELECT b FROM Booking b " +
            "JOIN FETCH b.user u " +
            "JOIN FETCH b.showtime s " +
            "JOIN FETCH s.movie m " +
            "LEFT JOIN FETCH b.bookingSeats bs " +
            "LEFT JOIN FETCH bs.seat st " +
            "LEFT JOIN FETCH st.screen sc " +
            "LEFT JOIN FETCH b.payment p " +
            "WHERE m.title LIKE %:search% OR u.email LIKE %:search%")
    Page<Booking> findByMovieTitleOrUserEmail(String search, Pageable pageable);

    @Query("SELECT b FROM Booking b " +
            "JOIN FETCH b.user u " +
            "JOIN FETCH b.showtime s " +
            "JOIN FETCH s.movie m " +
            "LEFT JOIN FETCH b.bookingSeats bs " +
            "LEFT JOIN FETCH bs.seat st " +
            "LEFT JOIN FETCH st.screen sc " +
            "LEFT JOIN FETCH b.payment p " +
            "WHERE b.id = :id")
    Optional<Booking> findByIdWithRelations(Long id);

    @Query("SELECT SUM(b.totalPriceMovie) FROM Booking b " +
            "LEFT JOIN b.payment p " +
            "WHERE b.createdAt BETWEEN :startDate AND :endDate " +
            "AND b.status = 'COMPLETED' " +
            "AND (p.paymentStatus = 'COMPLETED' OR p.paymentStatus IS NULL)")
    Double sumTotalPriceByDateRange(@Param("startDate") Date startDate, @Param("endDate") Date endDate);

    @Query("SELECT COUNT(bs) FROM Booking b JOIN b.bookingSeats bs " +
            "LEFT JOIN b.payment p " +
            "WHERE b.createdAt BETWEEN :startDate AND :endDate " +
            "AND b.status = 'COMPLETED' " +
            "AND (p.paymentStatus = 'COMPLETED' OR p.paymentStatus IS NULL)")
    Long countTicketsSold(@Param("startDate") Date startDate, @Param("endDate") Date endDate);

    @Query("SELECT new com.ra.base_spring_boot.dto.resp.TicketCountDto(s.screen.theater.id, COUNT(bs)) " +
            "FROM Booking b JOIN b.showtime s JOIN s.screen screens JOIN b.bookingSeats bs " +
            "LEFT JOIN b.payment p " +
            "WHERE b.createdAt BETWEEN :startDate AND :endDate " +
            "AND b.status = 'COMPLETED' " +
            "AND (p.paymentStatus = 'COMPLETED' OR p.paymentStatus IS NULL) " +
            "GROUP BY s.screen.theater.id")
    List<TicketCountDto> countTicketsPerTheater(@Param("startDate") Date startDate, @Param("endDate") Date endDate);

    @Query("SELECT new com.ra.base_spring_boot.dto.resp.TicketCountDto(s.movie.id, COUNT(bs)) " +
            "FROM Booking b JOIN b.showtime s JOIN b.bookingSeats bs " +
            "LEFT JOIN b.payment p " +
            "WHERE b.createdAt BETWEEN :startDate AND :endDate " +
            "AND b.status = 'COMPLETED' " +
            "AND (p.paymentStatus = 'COMPLETED' OR p.paymentStatus IS NULL) " +
            "GROUP BY s.movie.id")
    List<TicketCountDto> countTicketsPerMovie(@Param("startDate") Date startDate, @Param("endDate") Date endDate);

    List<Booking> findByUserIdAndStatus(Long userId, BookingStatus status);

    List<Booking> findByStatusAndCreatedAtBefore(BookingStatus status, Date createdAtBefore);
}