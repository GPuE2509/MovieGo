package com.ra.base_spring_boot.services.impl;

import com.ra.base_spring_boot.model.Booking;
import com.ra.base_spring_boot.model.User;
import com.ra.base_spring_boot.model.constants.BookingStatus;
import com.ra.base_spring_boot.model.constants.SeatType;
import com.ra.base_spring_boot.repository.IBookingRepository;
import com.ra.base_spring_boot.repository.IManageUsersRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PaymentStatusSyncServiceImpl {
    private final IBookingRepository bookingRepository;
    private final IManageUsersRepository userRepository;

    @Async
    @Transactional
    public void syncBookingStatusWithPayment(Long bookingId) {
        Booking booking = bookingRepository.findByIdWithRelations(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + bookingId));
        if (booking.getPayment() == null) {
            throw new RuntimeException("No payment found for booking");
        }
        BookingStatus newStatus = switch (booking.getPayment().getPaymentStatus()) {
            case PENDING -> BookingStatus.PENDING;
            case COMPLETED -> BookingStatus.COMPLETED;
            case CANCELLED, FAILED -> BookingStatus.CANCELLED;
            default -> throw new RuntimeException("Invalid payment status");
        };
        booking.setStatus(newStatus);
        if (booking.getStatus() == BookingStatus.COMPLETED) {
            awardPointsForBooking(booking.getUser().getId(), booking);
        }
        bookingRepository.save(booking);
    }

    @Transactional
    public void awardPointsForBooking(Long userId, Booking booking) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        int pointsToAward = calculatePoints(booking);
        user.setPoint(user.getPoint() + pointsToAward);
        userRepository.save(user);
    }

    private int calculatePoints(Booking booking) {
        if (booking.getBookingSeats() == null || booking.getBookingSeats().isEmpty()) {
            return 0;
        }
        return booking.getBookingSeats().stream()
                .mapToInt(bookingSeat -> {
                    SeatType seatType = bookingSeat.getSeat().getType();
                    int quantity = bookingSeat.getQuantity();
                    return switch (seatType) {
                        case STANDARD -> quantity * 10;
                        case VIP -> quantity * 15;
                        case SWEETBOX -> quantity * 20;
                    };
                })
                .sum();
    }
}
