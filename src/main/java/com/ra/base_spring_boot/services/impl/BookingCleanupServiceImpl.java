package com.ra.base_spring_boot.services.impl;

import com.ra.base_spring_boot.model.Booking;
import com.ra.base_spring_boot.model.constants.BookingStatus;
import com.ra.base_spring_boot.repository.IBookingRepository;
import com.ra.base_spring_boot.repository.IBookingSeatRepository;
import com.ra.base_spring_boot.services.IWebSocketService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;
import java.util.Date;
import java.util.List;

import static com.ra.base_spring_boot.services.impl.BookingServiceImpl.ICT_ZONE;

@Service
@RequiredArgsConstructor
public class BookingCleanupServiceImpl {

    private final IBookingRepository bookingRepository;
    private final IBookingSeatRepository bookingSeatRepository;
    private final IWebSocketService webSocketService;

    @Scheduled(fixedRate = 60000)
    public void cleanupExpiredBookings() {
        ZonedDateTime now = ZonedDateTime.now(ICT_ZONE);
        List<Booking> expiredBookings = bookingRepository.findByStatusAndCreatedAtBefore(
                BookingStatus.PENDING,
                Date.from(now.minusMinutes(15).toInstant())
        );

        for (Booking booking : expiredBookings) {
            booking.setStatus(BookingStatus.CANCELLED);
            bookingRepository.save(booking);

            List<Long> seatIds = bookingSeatRepository.findByBookingId(booking.getId())
                    .stream()
                    .map(bookingSeat -> bookingSeat.getSeat().getId())
                    .toList();

            webSocketService.notifySeatStatusChange(booking.getShowtime().getId(), seatIds, false);
        }
    }
}
