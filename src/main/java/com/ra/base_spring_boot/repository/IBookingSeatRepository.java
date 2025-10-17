package com.ra.base_spring_boot.repository;

import com.ra.base_spring_boot.model.BookingSeat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IBookingSeatRepository extends JpaRepository<BookingSeat, Long> {
    @Query("SELECT bs FROM BookingSeat bs WHERE bs.booking.showtime.id = :showtimeId AND bs.seat.id IN :seatIds")
    List<BookingSeat> findByShowtimeIdAndSeatIds(Long showtimeId, List<Long> seatIds);

    @Query("SELECT bs.seat.id FROM BookingSeat bs WHERE bs.booking.showtime.id = :showtimeId")
    List<Long> findBookedSeatIdsByShowtime(@Param("showtimeId") Long showtimeId);

    @Query(value = "SELECT bs.seat_id FROM booking_seat bs " +
            "INNER JOIN bookings b ON bs.booking_id = b.id " +
            "LEFT JOIN payments p ON b.id = p.booking_id " +
            "WHERE b.showtime_id = :showtimeId " +
            "AND (b.status IN ('PENDING', 'COMPLETED') " +
            "OR (b.status = 'CANCELLED' AND (p.payment_status IS NULL OR p.payment_status NOT IN ('FAILED', 'CANCELLED'))))",
            nativeQuery = true)
    List<Long> findBookedSeatIdsByShowtimeAndStatus(@Param("showtimeId") Long showtimeId);

    List<BookingSeat> findAllBySeatId(Long seatId);

    List<BookingSeat> findByBookingId(Long bookingId);
}