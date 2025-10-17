package com.ra.base_spring_boot.services.impl;

import com.ra.base_spring_boot.dto.resp.TicketPriceResponse;
import com.ra.base_spring_boot.model.Showtime;
import com.ra.base_spring_boot.model.TicketPrice;
import com.ra.base_spring_boot.model.constants.SeatType;
import com.ra.base_spring_boot.model.constants.MovieType;
import com.ra.base_spring_boot.repository.ITicketPriceRepository;
import com.ra.base_spring_boot.services.ITicketPriceService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.sql.Time;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TicketPriceServiceImpl implements ITicketPriceService {

    private static final Logger logger = LoggerFactory.getLogger(TicketPriceServiceImpl.class);
    private final ITicketPriceRepository ticketPriceRepository;

    @Override
    public Page<TicketPrice> getAllTicketPrices(String typeSeat, String typeMovie, String sortBy, Pageable pageable) {
        SeatType seatType = typeSeat != null ? SeatType.valueOf(typeSeat) : null;
        MovieType movieType = typeMovie != null ? MovieType.valueOf(typeMovie) : null;
        return ticketPriceRepository.findByTypeSeatAndTypeMovie(seatType, movieType, pageable);
    }

    @Override
    public List<TicketPriceResponse> getAllTicketPricesForHomePage() {
        List<TicketPrice> ticketPriceList = ticketPriceRepository.findAll(Sort.by(Sort.Direction.ASC, "price"));
        return ticketPriceList.stream()
                .map(ticketPrice -> TicketPriceResponse.builder()
                        .id(ticketPrice.getId())
                        .typeSeat(ticketPrice.getTypeSeat())
                        .typeMovie(ticketPrice.getTypeMovie())
                        .price(ticketPrice.getPrice())
                        .dayType(ticketPrice.isDayType())
                        .startTime(ticketPrice.getStartTime())
                        .endTime(ticketPrice.getEndTime())
                        .build())
                .toList();
    }

    @Override
    public TicketPrice getTicketPriceById(Long id) {
        return ticketPriceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket price not found with id: " + id));
    }

    @Override
    public TicketPrice addTicketPrice(TicketPrice ticketPrice) {
        return ticketPriceRepository.save(ticketPrice);
    }

    @Override
    public TicketPrice updateTicketPrice(Long id, TicketPrice ticketPrice) {
        TicketPrice existingTicketPrice = ticketPriceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket price not found"));
        existingTicketPrice.setTypeSeat(ticketPrice.getTypeSeat());
        existingTicketPrice.setTypeMovie(ticketPrice.getTypeMovie());
        existingTicketPrice.setPrice(ticketPrice.getPrice());
        existingTicketPrice.setDayType(ticketPrice.isDayType());
        existingTicketPrice.setStartTime(ticketPrice.getStartTime());
        existingTicketPrice.setEndTime(ticketPrice.getEndTime());
        return ticketPriceRepository.save(existingTicketPrice);
    }

    @Override
    public void deleteTicketPrice(Long id) {
        ticketPriceRepository.deleteById(id);
    }

    @Override
    public TicketPriceResponse getPriceBySeatAndMovieType(String typeSeat, String typeMovie) {
        try {
            SeatType seatType = SeatType.valueOf(typeSeat);
            MovieType movieType = MovieType.valueOf(typeMovie);
            ZoneId zoneId = ZoneId.of("Asia/Ho_Chi_Minh");
            LocalTime localTime = LocalTime.now(zoneId);
            Time currentTime = Time.valueOf(localTime);
            boolean isWeekend = ZonedDateTime.now(zoneId).getDayOfWeek().getValue() >= 6;

            logger.debug("Fetching ticket price for seat type: {}, movie type: {}, day type: {}, current time: {}",
                    typeSeat, typeMovie, isWeekend, currentTime);

            TicketPrice ticketPrice = ticketPriceRepository.findByTypeSeatAndTypeMovieAndDayType(seatType, movieType, isWeekend, currentTime)
                    .orElseThrow(() -> {
                        logger.error("No ticket price found for seat type: {}, movie type: {}, day type: {}, time: {}",
                                typeSeat, typeMovie, isWeekend, currentTime);
                        return new RuntimeException(
                                String.format("Ticket price not found for seat type %s, movie type %s, day type %s, time %s",
                                        typeSeat, typeMovie, isWeekend, currentTime));
                    });
            return TicketPriceResponse.builder()
                    .id(ticketPrice.getId())
                    .typeSeat(ticketPrice.getTypeSeat())
                    .typeMovie(ticketPrice.getTypeMovie())
                    .price(ticketPrice.getPrice())
                    .dayType(ticketPrice.isDayType())
                    .startTime(ticketPrice.getStartTime())
                    .endTime(ticketPrice.getEndTime())
                    .build();
        } catch (IllegalArgumentException e) {
            logger.error("Invalid seat type or movie type provided: {}", e.getMessage());
            throw new RuntimeException("Invalid seat type or movie type provided");
        }
    }

    @Override
    public Page<TicketPriceResponse> getApplicableTicketPrices(Showtime showtime, Pageable pageable) {
        ZoneId zoneId = ZoneId.of("Asia/Ho_Chi_Minh");
        LocalTime showtimeLocalTime = showtime.getStartTime().toInstant().atZone(zoneId).toLocalTime();
        Time showtimeTime = Time.valueOf(showtimeLocalTime);
        boolean isWeekend = showtime.getStartTime().toInstant().atZone(zoneId).getDayOfWeek().getValue() >= 6;

        logger.debug("Fetching applicable ticket prices for showtime: {}, movie type: {}, day type: {}, time: {}",
                showtime.getId(), showtime.getMovie().getType(), isWeekend, showtimeTime);

        Page<TicketPrice> ticketPrices = ticketPriceRepository.findApplicableTicketPrices(
                showtime.getMovie().getType(), isWeekend, showtimeTime, pageable);

        List<TicketPriceResponse> responseList = ticketPrices.getContent().stream()
                .map(ticketPrice -> TicketPriceResponse.builder()
                        .id(ticketPrice.getId())
                        .typeSeat(ticketPrice.getTypeSeat())
                        .typeMovie(ticketPrice.getTypeMovie())
                        .price(ticketPrice.getPrice())
                        .dayType(ticketPrice.isDayType())
                        .startTime(ticketPrice.getStartTime())
                        .endTime(ticketPrice.getEndTime())
                        .build())
                .toList();

        if (responseList.isEmpty()) {
            logger.warn("No applicable ticket prices found for showtime: {}, movie type: {}, day type: {}, time: {}",
                    showtime.getId(), showtime.getMovie().getType(), isWeekend, showtimeTime);
        }

        return new PageImpl<>(responseList, pageable, ticketPrices.getTotalElements());
    }
}