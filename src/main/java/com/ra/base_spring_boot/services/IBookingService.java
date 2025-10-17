package com.ra.base_spring_boot.services;

import com.ra.base_spring_boot.dto.req.FormBooking;
import com.ra.base_spring_boot.dto.resp.*;
import com.ra.base_spring_boot.model.constants.BookingStatus;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface IBookingService {
    BookingResponse createBooking(Long userId, FormBooking request, HttpServletRequest httpRequest);
    BookingResponse getBookingById(Long id, Long userId);
    List<BookingHistoryResponse> getBookingsByUserId(Long userId);
    Long getUserIdByUsername(String username);
    BookingResponse reserveSeats(Long showtimeId, List<Long> seatIds, HttpServletRequest httpRequest);
    BookingResponse createPayment(Long bookingId, Long userId, Long paymentMethodId, HttpServletRequest httpRequest);
    Page<AdminBookingResponse> getAllBookings(String search, Pageable pageable);
    AdminBookingResponse updateBookingStatus(Long id, BookingStatus status);
    AdminBookingResponse getBookingByIdAdmin(Long id);
    List<HistoryAwardResponse> getAllHistoryAwards(Long id);

    CouponApplyResponse applyCouponToBooking(Long userId, Long bookingId, String couponCode);
}
