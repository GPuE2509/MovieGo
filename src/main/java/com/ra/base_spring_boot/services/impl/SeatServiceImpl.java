package com.ra.base_spring_boot.services.impl;

import com.ra.base_spring_boot.dto.req.FormSeat;
import com.ra.base_spring_boot.dto.resp.PageResponse;
import com.ra.base_spring_boot.dto.resp.RowSeatResponse;
import com.ra.base_spring_boot.dto.resp.SeatResponse;
import com.ra.base_spring_boot.dto.resp.SeatStatusResponse;
import com.ra.base_spring_boot.model.Screen;
import com.ra.base_spring_boot.model.Seat;
import com.ra.base_spring_boot.model.Showtime;
import com.ra.base_spring_boot.model.TicketPrice;
import com.ra.base_spring_boot.model.constants.MovieType;
import com.ra.base_spring_boot.model.constants.SeatType;
import com.ra.base_spring_boot.repository.*;
import com.ra.base_spring_boot.services.ISeatService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.sql.Time;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SeatServiceImpl implements ISeatService {

    private static final ZoneId ICT_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    private final ISeatRepository seatRepository;
    private final IScreenRepository screenRepository;
    private final IBookingSeatRepository bookingSeatRepository;
    private final IShowtimeRepository showtimeRepository;
    private final ITicketPriceRepository ticketPriceRepository;

    @Override
    @CacheEvict(value = "seatStatus", allEntries = true)
    public PageResponse<SeatResponse> getAllSeats(String keyword, Pageable pageable) {
        Page<Seat> seats = keyword == null || keyword.isEmpty()
                ? seatRepository.findBySeatNumberContainingIgnoreCaseAndDeletedFalse(keyword, pageable)
                : seatRepository.findByDeletedFalse(pageable);

        return PageResponse.<SeatResponse>builder()
                .data(seats.getContent().stream().map(seat -> SeatResponse.builder()
                        .id(seat.getId())
                        .screenId(seat.getScreen().getId())
                        .seatNumber(seat.getSeatNumber())
                        .row(seat.getRow())
                        .column(seat.getColumn())
                        .isVariable(seat.isVariable())
                        .type(seat.getType())
                        .createdAt(seat.getCreatedAt())
                        .updatedAt(seat.getUpdatedAt())
                        .build()).collect(Collectors.toList()))
                .page(seats.getNumber())
                .size(seats.getSize())
                .total(seats.getTotalElements())
                .totalPages(seats.getTotalPages())
                .hasPrevious(seats.getNumber() > 0)
                .hasNext(seats.hasNext())
                .build();
    }

    @Override
    @CacheEvict(value = "seatStatus", allEntries = true)
    public SeatResponse createSeat(FormSeat formSeat) {
        if (seatRepository.existsByScreenIdAndSeatNumber(formSeat.getScreenId(), formSeat.getSeatNumber())) {
            throw new RuntimeException("Seat number " + formSeat.getSeatNumber() + " already exists for this screen");
        }
        Screen screen = screenRepository.findById(formSeat.getScreenId())
                .orElseThrow(() -> new RuntimeException("Screen not found"));

        // Validate row (convert "A" -> 1, "B" -> 2, etc.)
        int rowNumber = formSeat.getRow().toUpperCase().charAt(0) - 'A' + 1;
        if (rowNumber < 1 || rowNumber > screen.getMaxRows()) {
            throw new IllegalArgumentException("Row is out of range for this screen. Max rows: " + screen.getMaxRows());
        }
        // Validate column
        if (formSeat.getColumn() < 1 || formSeat.getColumn() > screen.getMaxColumns()) {
            throw new IllegalArgumentException("Column is out of range for this screen. Max columns: " + screen.getMaxColumns());
        }

        Seat seat = Seat.builder()
                .screen(screen)
                .seatNumber(formSeat.getSeatNumber())
                .row(formSeat.getRow())
                .column(formSeat.getColumn())
                .isVariable(formSeat.getIsVariable())
                .type(formSeat.getType())
                .build();
        seat = seatRepository.save(seat);

        if (formSeat.getShowtimeId() != null) {
            Showtime showtime = showtimeRepository.findById(formSeat.getShowtimeId())
                    .orElseThrow(() -> new RuntimeException("Showtime not found"));
            if (!showtime.getScreen().getId().equals(formSeat.getScreenId())) {
                throw new IllegalArgumentException("The screen of the seat does not match the screen of the showtime.");
            }
        }

        // Update seatCapacity
        List<Seat> seats = seatRepository.findByScreen(screen);
        screen.setSeatCapacity(seats.size());
        screenRepository.save(screen);

        return SeatResponse.builder()
                .id(seat.getId())
                .screenId(screen.getId())
                .seatNumber(seat.getSeatNumber())
                .row(seat.getRow())
                .column(seat.getColumn())
                .isVariable(seat.isVariable())
                .type(seat.getType())
                .createdAt(seat.getCreatedAt())
                .updatedAt(seat.getUpdatedAt())
                .build();
    }

    @Override
    @CacheEvict(value = "seatStatus", allEntries = true)
    public SeatResponse updateSeat(Long id, FormSeat formSeat) {
        Seat seat = seatRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Seat not found"));
        if (seatRepository.existsByScreenIdAndSeatNumberAndIdNot(formSeat.getScreenId(), formSeat.getSeatNumber(), id)) {
            throw new RuntimeException("Seat number " + formSeat.getSeatNumber() + " already exists for this screen");
        }
        Screen screen = screenRepository.findById(formSeat.getScreenId())
                .orElseThrow(() -> new RuntimeException("Screen not found"));

        // Validate row
        int rowNumber = formSeat.getRow().toUpperCase().charAt(0) - 'A' + 1;
        if (rowNumber < 1 || rowNumber > screen.getMaxRows()) {
            throw new IllegalArgumentException("Row is out of range for this screen. Max rows: " + screen.getMaxRows());
        }
        // Validate column
        if (formSeat.getColumn() < 1 || formSeat.getColumn() > screen.getMaxColumns()) {
            throw new IllegalArgumentException("Column is out of range for this screen. Max columns: " + screen.getMaxColumns());
        }

        seat.setScreen(screen);
        seat.setSeatNumber(formSeat.getSeatNumber());
        seat.setRow(formSeat.getRow());
        seat.setColumn(formSeat.getColumn());
        seat.setVariable(formSeat.getIsVariable());
        seat.setType(formSeat.getType());
        seat = seatRepository.save(seat);

        // Update seatCapacity
        List<Seat> seats = seatRepository.findByScreen(screen);
        screen.setSeatCapacity(seats.size());
        screenRepository.save(screen);

        return SeatResponse.builder()
                .id(seat.getId())
                .screenId(screen.getId())
                .seatNumber(seat.getSeatNumber())
                .row(seat.getRow())
                .column(seat.getColumn())
                .isVariable(seat.isVariable())
                .type(seat.getType())
                .createdAt(seat.getCreatedAt())
                .updatedAt(seat.getUpdatedAt())
                .build();
    }

    @Override
    @CacheEvict(value = "seatStatus", allEntries = true)
    public void deleteSeat(Long id) {
        Seat seat = seatRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Seat not found"));
        Screen screen = seat.getScreen();
        seat.setDeleted(true);
        seatRepository.save(seat);

        // Update seatCapacity
        List<Seat> seats = seatRepository.findByScreen(screen);
        screen.setSeatCapacity(seats.size());
        screenRepository.save(screen);
    }

    @Override
    public List<RowSeatResponse> getSeatStatusByShowtimeAndTheater(Long showtimeId, Long theaterId) {
        try {
            Showtime showtime = showtimeRepository.findById(showtimeId)
                    .orElseThrow(() -> new RuntimeException("Showtime not found"));

            Long actualTheaterId = theaterId != null ? theaterId : showtime.getScreen().getTheater().getId();
            if (!showtime.getScreen().getTheater().getId().equals(actualTheaterId)) {
                throw new RuntimeException("Showtime " + showtimeId + " does not belong to theater " + actualTheaterId);
            }

            Screen screen = showtime.getScreen();
            int maxRows = screen.getMaxRows();
            int maxColumns = screen.getMaxColumns();

            boolean isWeekend = isWeekend(showtime.getStartTime(), ICT_ZONE);
            boolean isHoliday = isHoliday(showtime.getStartTime());
            LocalTime localTime = showtime.getStartTime().toInstant().atZone(ICT_ZONE).toLocalTime();
            Time startTime = Time.valueOf(localTime);

            List<Seat> seats = seatRepository.findByScreenAndDeletedFalse(screen);
            Integer seatCapacity = screen.getSeatCapacity();
            if (seatCapacity == null) {
                throw new RuntimeException("Seat capacity is null for screen: " + screen.getId());
            }

            List<Long> bookedSeatIds = bookingSeatRepository.findBookedSeatIdsByShowtimeAndStatus(showtimeId);
            Set<Long> bookedSeatIdSet = new HashSet<>(bookedSeatIds);

            Map<String, List<SeatStatusResponse>> seatMap = new HashMap<>();
            for (Seat seat : seats) {
                Optional<TicketPrice> ticketPriceOpt = ticketPriceRepository.findPrice(
                        seat.getType(), showtime.getMovie().getType(), isWeekend, startTime);
                double basePrice = ticketPriceOpt.map(TicketPrice::getPrice)
                        .orElseThrow(() -> new RuntimeException("No ticket price found"));

                double finalPrice = basePrice;
                if (isHoliday) {
                    finalPrice = adjustForHoliday(basePrice, seat.getType(), showtime.getMovie().getType(), startTime);
                }
                if (showtime.getMovie().getDuration() > 150) {
                    finalPrice += 10000;
                }

                boolean isBooked = bookedSeatIdSet.contains(seat.getId());
                SeatStatusResponse seatResponse = SeatStatusResponse.builder()
                        .seatId(seat.getId())
                        .seatNumber(seat.getSeatNumber())
                        .seatType(seat.getType().name())
                        .isBooked(isBooked)
                        .price(finalPrice)
                        .seatCapacity(seatCapacity)
                        .build();

                seatMap.computeIfAbsent(seat.getRow(), k -> new ArrayList<>()).add(seatResponse);
            }

            List<RowSeatResponse> rowSeats = new ArrayList<>();
            for (int rowNum = 1; rowNum <= maxRows; rowNum++) {
                String rowLetter = String.valueOf((char) ('A' + rowNum - 1));
                List<SeatStatusResponse> rowSeatsList = seatMap.getOrDefault(rowLetter, new ArrayList<>());
                for (int col = 1; col <= maxColumns; col++) {
                    String seatNumber = rowLetter + col;
                    boolean isSeatExists = rowSeatsList.stream().anyMatch(s -> s.getSeatNumber().equals(seatNumber));
                    if (!isSeatExists) {
                        SeatStatusResponse emptySeat = SeatStatusResponse.builder()
                                .seatId(0L)
                                .seatNumber(seatNumber)
                                .isBooked(false)
                                .seatCapacity(seatCapacity)
                                .price(0)
                                .build();
                        rowSeatsList.add(emptySeat);
                    }
                }
                rowSeatsList.sort(Comparator.comparing(SeatStatusResponse::getSeatNumber));
                rowSeats.add(RowSeatResponse.builder()
                        .row(rowLetter)
                        .seats(rowSeatsList)
                        .build());
            }

            rowSeats.sort(Comparator.comparing(RowSeatResponse::getRow));
            return rowSeats;
        } catch (Exception e) {
            throw new RuntimeException("Failed to retrieve seat status: " + e.getMessage(), e);
        }
    }

    @Override
    public List<RowSeatResponse> getAdminSeatStatusByShowtimeAndTheater(Long showtimeId, Long theaterId) {
        try {
            Showtime showtime = showtimeRepository.findById(showtimeId)
                    .orElseThrow(() -> new RuntimeException("Showtime not found"));

            Long actualTheaterId = theaterId != null ? theaterId : showtime.getScreen().getTheater().getId();
            if (!showtime.getScreen().getTheater().getId().equals(actualTheaterId)) {
                throw new RuntimeException("Showtime " + showtimeId + " does not belong to theater " + actualTheaterId);
            }

            Screen screen = showtime.getScreen();
            int maxRows = screen.getMaxRows();
            int maxColumns = screen.getMaxColumns();

            boolean isWeekend = isWeekend(showtime.getStartTime(), ICT_ZONE);
            boolean isHoliday = isHoliday(showtime.getStartTime());
            LocalTime localTime = showtime.getStartTime().toInstant().atZone(ICT_ZONE).toLocalTime();
            Time startTime = Time.valueOf(localTime);

            List<Seat> seats = seatRepository.findByScreen(screen);
            Integer seatCapacity = screen.getSeatCapacity();
            if (seatCapacity == null) {
                throw new RuntimeException("Seat capacity is null for screen: " + screen.getId());
            }

            List<Long> bookedSeatIds = bookingSeatRepository.findBookedSeatIdsByShowtimeAndStatus(showtimeId);
            Set<Long> bookedSeatIdSet = new HashSet<>(bookedSeatIds);

            Map<String, List<SeatStatusResponse>> seatMap = new HashMap<>();
            for (Seat seat : seats) {
                Optional<TicketPrice> ticketPriceOpt = ticketPriceRepository.findPrice(
                        seat.getType(), showtime.getMovie().getType(), isWeekend, startTime);
                double basePrice = ticketPriceOpt.map(TicketPrice::getPrice)
                        .orElseThrow(() -> new RuntimeException("No ticket price found"));

                double finalPrice = basePrice;
                if (isHoliday) {
                    finalPrice = adjustForHoliday(basePrice, seat.getType(), showtime.getMovie().getType(), startTime);
                }
                if (showtime.getMovie().getDuration() > 150) {
                    finalPrice += 10000;
                }

                boolean isBooked = bookedSeatIdSet.contains(seat.getId());
                SeatStatusResponse seatResponse = SeatStatusResponse.builder()
                        .seatId(seat.getId())
                        .seatNumber(seat.getSeatNumber())
                        .seatType(seat.getType().name())
                        .isBooked(isBooked)
                        .price(finalPrice)
                        .seatCapacity(seatCapacity)
                        .deleted(seat.isDeleted())
                        .build();

                seatMap.computeIfAbsent(seat.getRow(), k -> new ArrayList<>()).add(seatResponse);
            }

            List<RowSeatResponse> rowSeats = new ArrayList<>();
            for (int rowNum = 1; rowNum <= maxRows; rowNum++) {
                String rowLetter = String.valueOf((char) ('A' + rowNum - 1));
                List<SeatStatusResponse> rowSeatsList = seatMap.getOrDefault(rowLetter, new ArrayList<>());
                for (int col = 1; col <= maxColumns; col++) {
                    String seatNumber = rowLetter + col;
                    boolean isSeatExists = rowSeatsList.stream().anyMatch(s -> s.getSeatNumber().equals(seatNumber));
                    if (!isSeatExists) {
                        SeatStatusResponse emptySeat = SeatStatusResponse.builder()
                                .seatId(0L)
                                .seatNumber(seatNumber)
                                .isBooked(false)
                                .seatCapacity(seatCapacity)
                                .price(0)
                                .deleted(false)
                                .build();
                        rowSeatsList.add(emptySeat);
                    }
                }
                rowSeatsList.sort(Comparator.comparing(SeatStatusResponse::getSeatNumber));
                rowSeats.add(RowSeatResponse.builder()
                        .row(rowLetter)
                        .seats(rowSeatsList)
                        .build());
            }

            rowSeats.sort(Comparator.comparing(RowSeatResponse::getRow));
            return rowSeats;
        } catch (Exception e) {
            throw new RuntimeException("Failed to retrieve seat status for admin: " + e.getMessage(), e);
        }
    }

    @Override
    public PageResponse<SeatResponse> getAllDeletedSeats(String keyword, Pageable pageable) {
        Page<Seat> seats = keyword == null || keyword.isEmpty()
                ? seatRepository.findByDeletedTrue(pageable)
                : seatRepository.findBySeatNumberContainingIgnoreCaseAndDeletedTrue(keyword, pageable);

        return PageResponse.<SeatResponse>builder()
                .data(seats.getContent().stream().map(seat -> SeatResponse.builder()
                        .id(seat.getId())
                        .screenId(seat.getScreen().getId())
                        .seatNumber(seat.getSeatNumber())
                        .row(seat.getRow())
                        .column(seat.getColumn())
                        .isVariable(seat.isVariable())
                        .type(seat.getType())
                        .createdAt(seat.getCreatedAt())
                        .updatedAt(seat.getUpdatedAt())
                        .build()).collect(Collectors.toList()))
                .page(seats.getNumber())
                .size(seats.getSize())
                .total(seats.getTotalElements())
                .totalPages(seats.getTotalPages())
                .hasPrevious(seats.getNumber() > 0)
                .hasNext(seats.hasNext())
                .build();
    }

    @Override
    @CacheEvict(value = "seatStatus", allEntries = true)
    public SeatResponse restoreSeat(Long id) {
        Seat seat = seatRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Seat not found"));
        if (!seat.isDeleted()) {
            throw new IllegalStateException("Seat is not deleted");
        }
        seat.setDeleted(false);
        seat = seatRepository.save(seat);

        Screen screen = seat.getScreen();
        List<Seat> seats = seatRepository.findByScreen(screen);
        screen.setSeatCapacity(seats.size());
        screenRepository.save(screen);

        return SeatResponse.builder()
                .id(seat.getId())
                .screenId(screen.getId())
                .seatNumber(seat.getSeatNumber())
                .row(seat.getRow())
                .column(seat.getColumn())
                .isVariable(seat.isVariable())
                .type(seat.getType())
                .createdAt(seat.getCreatedAt())
                .updatedAt(seat.getUpdatedAt())
                .build();
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
}