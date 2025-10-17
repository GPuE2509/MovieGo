package com.ra.base_spring_boot.services.impl;

import com.ra.base_spring_boot.dto.req.FormBooking;
import com.ra.base_spring_boot.dto.resp.*;
import com.ra.base_spring_boot.model.*;
import com.ra.base_spring_boot.model.constants.BookingStatus;
import com.ra.base_spring_boot.model.constants.MovieType;
import com.ra.base_spring_boot.model.constants.PaymentStatus;
import com.ra.base_spring_boot.model.constants.SeatType;
import com.ra.base_spring_boot.repository.*;
import com.ra.base_spring_boot.services.*;
import com.ra.base_spring_boot.util.custom.PaymentTimeoutScheduler;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.sql.Time;
import java.text.SimpleDateFormat;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements IBookingService {
    @Autowired
    private ICouponService couponService;
    private static final Logger logger = LoggerFactory.getLogger(BookingServiceImpl.class);
    public static final ZoneId ICT_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    private final IBookingRepository bookingRepository;
    private final IBookingSeatRepository bookingSeatRepository;
    private final IUserRepository userRepository;
    private final IShowtimeRepository showtimeRepository;
    private final ISeatRepository seatRepository;
    private final ITicketPriceRepository ticketPriceRepository;
    private final IPaymentRepository paymentRepository;
    private final IPaymentMethodRepository paymentMethodRepository;
    private final IPaymentGatewayRegistry paymentServiceRegistry;
    private final PaymentTimeoutScheduler paymentTimeoutScheduler;
    private final IWebSocketService webSocketService;

    @Override
    public Page<AdminBookingResponse> getAllBookings(String search, Pageable pageable) {
        Page<Booking> bookings = (search == null || search.trim().isEmpty())
                ? bookingRepository.findAllWithRelations(pageable)
                : bookingRepository.findByMovieTitleOrUserEmail(search, pageable);
        return bookings.map(this::mapToAdminBookingResponse);
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

    @Override
    public List<HistoryAwardResponse> getAllHistoryAwards(Long id) {
        List<Booking> bookings = bookingRepository.findByUserId(id);
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
        sdf.setTimeZone(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        return bookings.stream()
                .filter(booking -> booking.getPayment() != null &&
                        booking.getPayment().getPaymentStatus() == PaymentStatus.COMPLETED ||
                        booking.getStatus() == BookingStatus.COMPLETED)
                .map(booking -> HistoryAwardResponse.builder()
                        .timePayment(booking.getPayment().getPaymentTime() != null
                                ? sdf.format(booking.getPayment().getPaymentTime())
                                : null)
                        .paymentMethod(booking.getPayment().getPaymentMethod() != null
                                ? booking.getPayment().getPaymentMethod().getName()
                                : "Unknown Payment Method")
                        .Award(calculatePoints(booking))
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    @Override
    public AdminBookingResponse updateBookingStatus(Long id, BookingStatus status) {
        Booking booking = bookingRepository.findByIdWithRelations(id)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + id));
        if (!isValidStatusTransition(booking.getStatus(), status)) {
            throw new RuntimeException("Invalid status transition from " + booking.getStatus() + " to " + status);
        }
        if (status == BookingStatus.CANCELLED && booking.getShowtime().getStartTime().before(new Date())) {
            throw new RuntimeException("Cannot cancel a booking for a showtime that has already started");
        }
        BookingStatus previousStatus = booking.getStatus();
        booking.setStatus(status);
        Payment payment = booking.getPayment();
        if (status == BookingStatus.CANCELLED && payment != null && payment.getPaymentStatus() == PaymentStatus.COMPLETED) {
            payment.setPaymentStatus(PaymentStatus.CANCELLED);
            payment.setPaymentTime(new Date());
            paymentRepository.save(payment);
            logger.info("Payment status updated to CANCELLED for booking ID: {}", id);
        }

        booking = bookingRepository.save(booking);
        if (status == BookingStatus.CANCELLED && (previousStatus == BookingStatus.PENDING || previousStatus == BookingStatus.COMPLETED)) {
            List<Long> seatIds = booking.getBookingSeats().stream()
                    .map(bookingSeat -> bookingSeat.getSeat().getId())
                    .collect(Collectors.toList());
            webSocketService.notifySeatStatusChange(booking.getShowtime().getId(), seatIds, false);
            logger.info("Seats unblocked for cancelled booking ID: {}", id);
        }
        logger.info("Booking status updated to {} for booking ID: {}", status, id);
        return mapToAdminBookingResponse(booking);
    }

    @Override
    public AdminBookingResponse getBookingByIdAdmin(Long id) {
        Booking booking = bookingRepository.findByIdWithRelations(id)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));
        return mapToAdminBookingResponse(booking);
    }

    @Transactional
    @Override
    @CacheEvict(value = "seatStatus", allEntries = true)
    public BookingResponse createBooking(Long userId, FormBooking request, HttpServletRequest httpRequest) {
        logger.info("Creating booking for user ID: {}, showtime ID: {}", userId, request.getShowtimeId());
        // Create booking first
        BookingResponse booking = createOrReserveBooking(userId, request.getShowtimeId(), request.getSeatIds(), httpRequest);
        return booking;
    }

    @Transactional
    @Override
    public CouponApplyResponse applyCouponToBooking(Long userId, Long bookingId, String couponCode) {
        try {
            // Validate and get coupon
            Coupon coupon = couponService.applyCouponToBooking(userId, couponCode);

            // Get booking
            Booking booking = bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new RuntimeException("Booking not found"));

            // Calculate discount
            double originalPrice = booking.getTotalPriceMovie();
            double discountedPrice = calculateDiscountedPrice(originalPrice, coupon);
            double discountAmount = originalPrice - discountedPrice;

            // Update booking with discount
            booking.setTotalPriceMovie(discountedPrice);
            booking.setUpdatedAt(new Date());
            bookingRepository.save(booking);

            // Remove coupon from user (one-time use)
            couponService.removeCouponFromUser(userId, coupon.getId());

            logger.info("Applied coupon {} to booking {}, original price: {}, discounted price: {}, discount amount: {}",
                    couponCode, bookingId, originalPrice, discountedPrice, discountAmount);

            return CouponApplyResponse.builder()
                    .finalAmount(discountedPrice)
                    .discountAmount(discountAmount)
                    .build();
        } catch (Exception e) {
            logger.error("Failed to apply coupon {} to booking {}: {}", couponCode, bookingId, e.getMessage());
            throw new RuntimeException("Failed to apply coupon: " + e.getMessage());
        }
    }

    public double calculateDiscountedPrice(double originalPrice, Coupon coupon) {
        if (coupon.getName().contains("%")) {
            // Percentage discount
            double discountPercent = coupon.getValue() / 100.0;
            return originalPrice * (1 - discountPercent);
        } else {
            // Fixed amount discount
            double discountedPrice = originalPrice - coupon.getValue();
            return Math.max(0, discountedPrice); // Ensure price doesn't go negative
        }
    }


    @Override
    public BookingResponse getBookingById(Long id, Long userId) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));
        if (!booking.getUser().getId().equals(userId)) {
            throw new SecurityException("You are not authorized to view this booking");
        }
        return mapToBookingResponse(booking);
    }

    @Override
    public List<BookingHistoryResponse> getBookingsByUserId(Long userId) {
        // Fetch bookings for the given userId
        List<Booking> bookings = bookingRepository.findByUserId(userId);

        // Map bookings to BookingHistoryResponse DTOs, filtering for COMPLETED payments and COMPLETED bookings
        return bookings.stream()
                .filter(booking -> booking.getPayment() != null &&
                        booking.getPayment().getPaymentStatus() == PaymentStatus.COMPLETED &&
                        booking.getStatus() == BookingStatus.COMPLETED)
                .map(booking -> {
                    // Get payment details
                    Payment payment = booking.getPayment();
                    Date paymentTime = payment != null ? payment.getPaymentTime() : null;

                    // Get movie name via showtime
                    Showtime showtime = booking.getShowtime();
                    String movieName = showtime != null && showtime.getMovie() != null
                            ? showtime.getMovie().getTitle()
                            : "Unknown Movie";

                    // Get seat numbers from bookingSeats
                    Set<String> seatNumbers = booking.getBookingSeats() != null
                            ? booking.getBookingSeats().stream()
                            .map(bookingSeat -> bookingSeat.getSeat().getSeatNumber())
                            .collect(Collectors.toSet())
                            : Collections.emptySet();

                    // Build BookingHistoryResponse
                    return BookingHistoryResponse.builder()
                            .paymentTime(paymentTime)
                            .movieName(movieName)
                            .numberSeat(seatNumbers)
                            .totalPriceMovie(booking.getTotalPriceMovie())
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Override
    public Long getUserIdByUsername(String username) {
        return userRepository.findByEmail(username)
                .map(User::getId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    @Transactional
    @Override
    public BookingResponse reserveSeats(Long showtimeId, List<Long> seatIds, HttpServletRequest httpRequest) {
        logger.info("Reserving seats for showtime ID: {}, seat IDs: {}", showtimeId, seatIds);
        return createOrReserveBooking(getCurrentUserId(), showtimeId, seatIds, httpRequest);
    }

    @Transactional
    @Override
    public BookingResponse createPayment(Long bookingId, Long userId, Long paymentMethodId, HttpServletRequest httpRequest) {
        logger.info("Creating payment for booking ID: {}, user ID: {}", bookingId, userId);
        Booking booking = bookingRepository.findByIdWithRelations(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));
        if (!booking.getUser().getId().equals(userId) || booking.getStatus() != BookingStatus.PENDING) {
            throw new SecurityException("Unauthorized or invalid booking status");
        }

        PaymentMethod paymentMethod = paymentMethodRepository.findById(paymentMethodId)
                .orElseThrow(() -> new IllegalArgumentException("Payment method not found"));
        String transactionId = UUID.randomUUID().toString();
        Payment payment = Payment.builder()
                .booking(booking)
                .paymentMethod(paymentMethod)
                .transactionId(transactionId)
                .paymentStatus(PaymentStatus.PENDING)
                .amount(booking.getTotalPriceMovie())
                .paymentTime(new Date())
                .build();
        paymentRepository.save(payment);
        booking.setPayment(payment);
        bookingRepository.save(booking);
        paymentTimeoutScheduler.schedulePaymentTimeout(payment);

        List<Long> seatIds = booking.getBookingSeats().stream()
                .map(bookingSeat -> bookingSeat.getSeat().getId())
                .collect(Collectors.toList());
        webSocketService.notifySeatStatusChange(booking.getShowtime().getId(), seatIds, true);

        String paymentUrl;
        try {
            IPaymentGatewayService paymentService = paymentServiceRegistry.getPaymentGatewayService(paymentMethod.getName());
            paymentUrl = paymentService.createPaymentUrl(booking, transactionId, httpRequest);
        } catch (Exception e) {
            logger.error("Failed to generate payment URL for transaction ID {}: {}", transactionId, e.getMessage());
            throw new RuntimeException("Failed to generate payment URL: " + e.getMessage());
        }

        BookingResponse response = mapToBookingResponse(booking);
        response.setPaymentUrl(paymentUrl);
        return response;
    }

    private BookingResponse createOrReserveBooking(Long userId, Long showtimeId, List<Long> seatIds, HttpServletRequest httpRequest) {
        // Optimized booking creation with better performance
        Date currentTime = Date.from(ZonedDateTime.now(ICT_ZONE).toInstant());
        
        // Parallel validation and data fetching
        CompletableFuture<User> userFuture = CompletableFuture.supplyAsync(() ->
                userRepository.findById(userId)
                        .orElseThrow(() -> new IllegalArgumentException("User not found")));
        
        CompletableFuture<Showtime> showtimeFuture = CompletableFuture.supplyAsync(() ->
                showtimeRepository.findById(showtimeId)
                        .orElseThrow(() -> new IllegalArgumentException("Showtime not found")));
        
        CompletableFuture<List<Seat>> seatsFuture = CompletableFuture.supplyAsync(() -> {
                List<Seat> seats = seatRepository.findAllByIdInAndDeletedFalse(seatIds);
                if (seats.size() != seatIds.size()) {
                    throw new IllegalArgumentException("Some seats are invalid or have been deleted");
                }
                return seats;
        });
        
        // Wait for all data to be fetched
        CompletableFuture<Void> allDataFuture = CompletableFuture.allOf(userFuture, showtimeFuture, seatsFuture);
        
        try {
            allDataFuture.get(); // Wait for all data to be available
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch required data: " + e.getMessage());
        }
        
        User user = userFuture.join();
        Showtime showtime = showtimeFuture.join();
        List<Seat> seats = seatsFuture.join();
        
        // Optimized seat availability check using native query
        List<Long> bookedSeatIds = bookingSeatRepository.findBookedSeatIdsByShowtimeAndStatus(showtime.getId());
        Set<Long> bookedSeatIdSet = new HashSet<>(bookedSeatIds);
        
        // Check if any requested seats are already booked
        for (Long seatId : seatIds) {
            if (bookedSeatIdSet.contains(seatId)) {
                throw new IllegalArgumentException("Seat ID " + seatId + " is already booked");
            }
        }
        
        // Calculate total price in parallel with seat availability check
        CompletableFuture<Double> priceFuture = CompletableFuture.supplyAsync(() -> 
                calculateTotalPrice(showtime, seats));
        
        // Create booking with optimized batch operations
        Booking booking = Booking.builder()
                .user(user)
                .showtime(showtime)
                .totalSeat(seats.size())
                .totalPriceMovie(priceFuture.join()) // Wait for price calculation
                .status(BookingStatus.PENDING)
                .createdAt(currentTime)
                .build();
        
        // Save booking first
        booking = bookingRepository.save(booking);
        
        // Create booking seats in batch
        final Booking finalBooking = booking;
        List<BookingSeat> bookingSeats = seats.stream()
                .map(seat -> BookingSeat.builder()
                        .booking(finalBooking)
                        .seat(seat)
                        .quantity(1)
                        .createdAt(currentTime)
                        .build())
                .collect(Collectors.toList());
        
        // Save all booking seats in one batch operation
        List<BookingSeat> savedBookingSeats = bookingSeatRepository.saveAll(bookingSeats);
        finalBooking.setBookingSeats(new HashSet<>(savedBookingSeats));
        
        // Notify WebSocket asynchronously to avoid blocking
        CompletableFuture.runAsync(() -> {
            try {
                webSocketService.notifySeatStatusChange(showtimeId, seatIds, true);
            } catch (Exception e) {
                logger.error("Failed to notify seat status change: {}", e.getMessage());
            }
        });
        
        return mapToBookingResponse(booking);
    }

    private AdminBookingResponse mapToAdminBookingResponse(Booking booking) {
        List<SeatResponse> seatResponses = booking.getBookingSeats().stream()
                .map(bs -> SeatResponse.builder()
                        .id(bs.getSeat().getId())
                        .screenId(bs.getSeat().getScreen().getId())
                        .seatNumber(bs.getSeat().getSeatNumber())
                        .isVariable(bs.getSeat().isVariable())
                        .type(bs.getSeat().getType())
                        .createdAt(bs.getSeat().getCreatedAt())
                        .updatedAt(bs.getSeat().getUpdatedAt())
                        .build())
                .collect(Collectors.toList());
        return AdminBookingResponse.builder()
                .id(booking.getId())
                .userId(booking.getUser().getId())
                .userEmail(booking.getUser().getEmail())
                .showtimeId(booking.getShowtime().getId())
                .movieTitle(booking.getShowtime().getMovie().getTitle())
                .screenName(booking.getShowtime().getScreen().getName())
                .startTime(booking.getShowtime().getStartTime())
                .totalSeat(booking.getTotalSeat())
                .totalPriceMovie(booking.getTotalPriceMovie())
                .bookingStatus(booking.getStatus())
                .paymentStatus(booking.getPayment() != null ? booking.getPayment().getPaymentStatus() : PaymentStatus.PENDING)
                .createdAt(booking.getCreatedAt())
                .updatedAt(booking.getUpdatedAt())
                .bookedSeats(seatResponses)
                .build();
    }

    private BookingResponse mapToBookingResponse(Booking booking) {
        return BookingResponse.builder()
                .id(booking.getId())
                .userId(booking.getUser().getId())
                .showtimeId(booking.getShowtime().getId())
                .totalSeat(booking.getTotalSeat())
                .totalPriceMovie(booking.getTotalPriceMovie())
                .paymentStatus(booking.getPayment() != null ? booking.getPayment().getPaymentStatus() : PaymentStatus.PENDING)
                .createdAt(booking.getCreatedAt())
                .seatNames(booking.getBookingSeats().stream()
                        .map(bs -> bs.getSeat().getSeatNumber())
                        .collect(Collectors.toSet()))
                .build();
    }

    private boolean isValidStatusTransition(BookingStatus current, BookingStatus next) {
        if (current == BookingStatus.PENDING) {
            return next == BookingStatus.COMPLETED || next == BookingStatus.CANCELLED;
        }
        if (current == BookingStatus.COMPLETED) {
            return next == BookingStatus.CANCELLED;
        }
        if (current == BookingStatus.CANCELLED) {
            return false;
        }
        return false;
    }

    private double calculateTotalPrice(Showtime showtime, List<Seat> seats) {
        ZoneId zoneId = ZoneId.of("Asia/Ho_Chi_Minh");
        boolean isWeekend = isWeekend(showtime.getStartTime(), zoneId);
        boolean isHoliday = isHoliday(showtime.getStartTime());
        LocalTime localTime = showtime.getStartTime().toInstant().atZone(zoneId).toLocalTime();
        Time sqlTime = Time.valueOf(localTime);

        double totalPrice = seats.stream()
                .mapToDouble(seat -> {
                    Optional<TicketPrice> ticketPriceOpt = ticketPriceRepository.findPrice(
                            seat.getType(), showtime.getMovie().getType(), isWeekend || isHoliday, sqlTime);
                    double basePrice = ticketPriceOpt.map(TicketPrice::getPrice)
                            .orElseThrow(() -> new IllegalArgumentException("Ticket price not found for seat type: " + seat.getType()));

                    if (isHoliday) {
                        basePrice = adjustForHoliday(basePrice, seat.getType(), showtime.getMovie().getType(), sqlTime);
                    }

                    return basePrice;
                })
                .sum();

        if (showtime.getMovie().getDuration() > 150) {
            totalPrice += 10000 * seats.size();
        }

        return totalPrice;
    }

    private double adjustForHoliday(double basePrice, SeatType seatType, MovieType movieType, Time time) {
        double holidaySurchargePercentage = 0.15;

        double adjustedPrice = basePrice * (1 + holidaySurchargePercentage);

        Optional<TicketPrice> holidayPriceOpt = ticketPriceRepository.findPrice(seatType, movieType, true, time);
        if (holidayPriceOpt.isPresent()) {
            adjustedPrice = holidayPriceOpt.get().getPrice();
        }

        return Math.max(basePrice, adjustedPrice);
    }

    private boolean isHoliday(Date startTime) {
        Calendar cal = Calendar.getInstance();
        cal.setTime(startTime);
        int day = cal.get(Calendar.DAY_OF_MONTH);
        int month = cal.get(Calendar.MONTH) + 1;
        int year = cal.get(Calendar.YEAR);

        Set<String> holidays = new HashSet<>(Arrays.asList(
                "01/01", "10/03", "30/04", "01/05", "02/09",
                "14/02", "08/03", "24/12",
                "20/10", "20/11", "31/10"
        ));
        String dateKey = String.format("%02d/%02d", day, month);
        return holidays.contains(dateKey);
    }

    private boolean isWeekend(Date date, ZoneId zoneId) {
        return date.toInstant().atZone(zoneId).getDayOfWeek().getValue() >= 6;
    }

    private Long getCurrentUserId() {
        return getUserIdByUsername(SecurityContextHolder.getContext().getAuthentication().getName());
    }
}