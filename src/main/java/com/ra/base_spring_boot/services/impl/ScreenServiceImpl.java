package com.ra.base_spring_boot.services.impl;

import com.ra.base_spring_boot.dto.req.FormScreen;
import com.ra.base_spring_boot.dto.req.FormSeat;
import com.ra.base_spring_boot.dto.resp.PageResponse;
import com.ra.base_spring_boot.dto.resp.ScreenResp;
import com.ra.base_spring_boot.model.Screen;
import com.ra.base_spring_boot.model.Seat;
import com.ra.base_spring_boot.model.Theater;
import com.ra.base_spring_boot.model.constants.SeatType;
import com.ra.base_spring_boot.repository.IBookingSeatRepository;
import com.ra.base_spring_boot.repository.IScreenRepository;
import com.ra.base_spring_boot.repository.ISeatRepository;
import com.ra.base_spring_boot.repository.ITheaterRepository;
import com.ra.base_spring_boot.services.IScreenService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ScreenServiceImpl implements IScreenService {
    @Autowired
    private IScreenRepository screenRepository;
    @Autowired
    private ITheaterRepository theaterRepository;
    @Autowired
    private ISeatRepository seatRepository;
    @Autowired
    private IBookingSeatRepository bookingSeatRepository;

    @Override
    public PageResponse<ScreenResp> getAllScreens(int page, int pageSize, String sortField, String sortOrder, String search) {
        Sort sort = Sort.by(sortOrder.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC, sortField);
        Pageable pageable = PageRequest.of(page, pageSize, sort);
        Page<Screen> screenPage;
        if (StringUtils.hasText(search)) {
            screenPage = screenRepository.findByNameContainingIgnoreCaseAndDeleted(search, false, pageable);
        } else {
            screenPage = screenRepository.findAllByDeleted(false, pageable);
        }
        List<ScreenResp> screenDTO = screenPage.getContent().stream()
                .map(screen -> ScreenResp.builder()
                        .id(screen.getId())
                        .name(screen.getName())
                        .seatCapacity(screen.getSeatCapacity())
                        .theater(screen.getTheater())
                        .maxRows(screen.getMaxRows())
                        .maxColumns(screen.getMaxColumns())
                        .createdAt(screen.getCreatedAt())
                        .updatedAt(screen.getUpdatedAt())
                        .build())
                .collect(Collectors.toList());
        PageResponse<ScreenResp> response = new PageResponse<>();
        response.setTotal(screenPage.getTotalElements());
        response.setPage(screenPage.getNumber());
        response.setSize(screenPage.getSize());
        response.setData(screenDTO);
        return response;
    }

    @Override
    public List<Screen> getScreenByTheaterId(Long id) {
        Theater theater = theaterRepository.findTheaterByIdAndDeleted(id, false)
                .orElseThrow(() -> new RuntimeException("Theater not found or deleted"));
        return screenRepository.findByTheaterIdAndDeleted(theater.getId(), false);
    }

    @Transactional
    @Override
    public void createScreen(FormScreen formScreen) {
        // Validate inputs
        if (formScreen.getSeat_capacity() == null) {
            throw new IllegalArgumentException("Seat capacity is required");
        }
        if (formScreen.getMax_rows() % 2 != 0 || formScreen.getMax_columns() % 2 != 0) {
            throw new IllegalArgumentException("Max rows and max columns must be even numbers");
        }
        int calculatedCapacity = formScreen.getMax_rows() * formScreen.getMax_columns();
        if (formScreen.getSeat_capacity() > calculatedCapacity) {
            throw new IllegalArgumentException(
                    String.format("Seat capacity (%d) cannot be greater than max_rows * max_columns (%d)",
                            formScreen.getSeat_capacity(), calculatedCapacity)
            );
        }
        if (formScreen.getSeat_capacity() < 50 || formScreen.getSeat_capacity() > 250) {
            throw new IllegalArgumentException("Seat capacity must be between 50 and 250");
        }

        Theater theater = theaterRepository.findTheaterByIdAndDeleted(formScreen.getTheater_id(), false)
                .orElseThrow(() -> new RuntimeException("Theater not found"));

        boolean isDuplicate = screenRepository.findByTheaterIdAndDeleted(theater.getId(), false).stream()
                .anyMatch(s -> s.getName().equalsIgnoreCase(formScreen.getName()));
        if (isDuplicate) {
            throw new RuntimeException("Screen name already exists in this theater");
        }

        Screen screen = Screen.builder()
                .name(formScreen.getName())
                .seatCapacity(formScreen.getSeat_capacity())
                .maxRows(formScreen.getMax_rows())
                .maxColumns(formScreen.getMax_columns())
                .theater(theater)
                .deleted(false)
                .build();
        screen = screenRepository.save(screen);

        // Generate or use provided seat layout
        List<FormSeat> seatLayout = formScreen.getSeat_layout() != null
                ? formScreen.getSeat_layout()
                : generateDefaultSeatLayout(formScreen);

        // Validate even seats per row
        Map<String, Integer> seatsPerRow = new HashMap<>();
        for (FormSeat seat : seatLayout) {
            seatsPerRow.merge(seat.getRow(), 1, Integer::sum);
        }
        for (Map.Entry<String, Integer> entry : seatsPerRow.entrySet()) {
            if (entry.getValue() % 2 != 0) {
                throw new IllegalArgumentException("Row " + entry.getKey() + " has an odd number of seats: " + entry.getValue());
            }
        }

        int seatsCreated = 0;
        for (FormSeat seat : seatLayout) {
            if (seatsCreated >= formScreen.getSeat_capacity()) break;
            if (seatRepository.existsByScreenIdAndSeatNumber(screen.getId(), seat.getSeatNumber())) {
                continue;
            }
            int rowNumber = seat.getRow().toUpperCase().charAt(0) - 'A' + 1;
            if (rowNumber < 1 || rowNumber > screen.getMaxRows()) {
                throw new IllegalArgumentException("Row is out of range for this screen. Max rows: " + screen.getMaxRows());
            }
            if (seat.getColumn() < 1 || seat.getColumn() > screen.getMaxColumns()) {
                throw new IllegalArgumentException("Column is out of range for this screen. Max columns: " + screen.getMaxColumns());
            }
            Seat newSeat = Seat.builder()
                    .screen(screen)
                    .seatNumber(seat.getSeatNumber())
                    .row(seat.getRow())
                    .column(seat.getColumn())
                    .isVariable(seat.getIsVariable() != null ? seat.getIsVariable() : false)
                    .type(seat.getType() != null ? seat.getType() : SeatType.STANDARD)
                    .deleted(false)
                    .build();
            seatRepository.save(newSeat);
            seatsCreated++;
        }

        // Update seat capacity based on actual seats created
        screen.setSeatCapacity(seatRepository.findByScreenAndDeletedFalse(screen).size());
        screenRepository.save(screen);
    }

    @Transactional
    @Override
    public void updateScreen(Long id, FormScreen formScreen) {
        Screen screen = screenRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Screen not found"));
        if (screen.isDeleted()) throw new RuntimeException("Screen is deleted");

        if (formScreen.getMax_rows() % 2 != 0 || formScreen.getMax_columns() % 2 != 0) {
            throw new IllegalArgumentException("Max rows and max columns must be even numbers");
        }

        Theater theater = theaterRepository.findTheaterByIdAndDeleted(formScreen.getTheater_id(), false)
                .orElseThrow(() -> new RuntimeException("Theater not found or deleted"));

        boolean dup = screenRepository.findByTheaterIdAndDeleted(theater.getId(), false).stream()
                .anyMatch(s -> s.getName().equalsIgnoreCase(formScreen.getName()) && !s.getId().equals(id));
        if (dup) throw new RuntimeException("Screen name already exists in this theater");

        int capCalc = formScreen.getMax_rows() * formScreen.getMax_columns();
        if (formScreen.getSeat_capacity() > capCalc) {
            throw new IllegalArgumentException("Seat capacity cannot exceed max_rows*max_columns");
        }
        if (formScreen.getSeat_capacity() < 50 || formScreen.getSeat_capacity() > 250) {
            throw new IllegalArgumentException("Seat capacity must be between 50 and 250");
        }

        int oldRows = screen.getMaxRows(), oldCols = screen.getMaxColumns();
        int newRows = formScreen.getMax_rows(), newCols = formScreen.getMax_columns();

        // Prevent shrinking if it affects booked seats
        if (newRows < oldRows || newCols < oldCols) {
            List<Seat> active = seatRepository.findByScreenAndDeletedFalse(screen);
            List<Seat> toRemove = active.stream()
                    .filter(s -> {
                        int r = s.getRow().toUpperCase().charAt(0) - 'A' + 1;
                        return r > newRows || s.getColumn() > newCols;
                    })
                    .collect(Collectors.toList());

            boolean anyBooked = toRemove.stream()
                    .anyMatch(s -> !bookingSeatRepository.findAllBySeatId(s.getId()).isEmpty());
            if (anyBooked) {
                throw new RuntimeException("Cannot shrink screen: some seats in the removed area are booked");
            }

            toRemove.forEach(s -> {
                s.setDeleted(true);
                seatRepository.save(s);
            });
        }

        // Update screen details
        screen.setName(formScreen.getName());
        screen.setTheater(theater);
        screen.setMaxRows(newRows);
        screen.setMaxColumns(newCols);

        // Handle seat layout
        List<FormSeat> layout = formScreen.getSeat_layout() != null
                ? formScreen.getSeat_layout()
                : generateDefaultSeatLayout(formScreen);

        // Validate even seats per row
        Map<String, Integer> seatsPerRow = new HashMap<>();
        for (FormSeat seat : layout) {
            seatsPerRow.merge(seat.getRow(), 1, Integer::sum);
        }
        for (Map.Entry<String, Integer> entry : seatsPerRow.entrySet()) {
            if (entry.getValue() % 2 != 0) {
                throw new IllegalArgumentException("Row " + entry.getKey() + " has an odd number of seats: " + entry.getValue());
            }
        }

        // Update or add seats
        Set<String> existing = seatRepository.findByScreenAndDeletedFalse(screen).stream()
                .map(Seat::getSeatNumber)
                .collect(Collectors.toSet());
        layout.forEach(fs -> {
            String num = fs.getSeatNumber();
            if (!existing.contains(num)) {
                int r = fs.getRow().toUpperCase().charAt(0) - 'A' + 1;
                if (r < 1 || r > newRows || fs.getColumn() < 1 || fs.getColumn() > newCols) return;
                Seat s = Seat.builder()
                        .screen(screen)
                        .seatNumber(num)
                        .row(fs.getRow())
                        .column(fs.getColumn())
                        .isVariable(fs.getIsVariable() != null && fs.getIsVariable())
                        .type(fs.getType() != null ? fs.getType() : SeatType.STANDARD)
                        .deleted(false)
                        .build();
                seatRepository.save(s);
            }
        });

        // Update seat capacity
        screen.setSeatCapacity(seatRepository.findByScreenAndDeletedFalse(screen).size());
        screenRepository.save(screen);
    }

    private List<FormSeat> generateDefaultSeatLayout(FormScreen formScreen) {
        int requiredSeats = formScreen.getSeat_capacity();
        int maxRows = formScreen.getMax_rows();
        int maxColumns = formScreen.getMax_columns();

        // Ensure even number of seats per row, accounting for aisle
        int seatsPerRow = (int) Math.ceil((double) requiredSeats / maxRows);
        if (seatsPerRow % 2 != 0) {
            seatsPerRow++; // Round up to next even number
        }
        if (seatsPerRow > maxColumns) {
            throw new IllegalArgumentException(
                    String.format("Cannot create %d seats per row with max_columns = %d", seatsPerRow, maxColumns)
            );
        }

        // Introduce a central aisle: skip middle column(s) if maxColumns >= 4
        int aisleColumn = maxColumns >= 4 ? (maxColumns / 2) + 1 : 0; // Middle column for aisle
        int seatsPerBlock = seatsPerRow / 2; // Split seats evenly between left and right blocks

        int fullRows = requiredSeats / seatsPerRow;
        int remainingSeats = requiredSeats % seatsPerRow;
        if (remainingSeats % 2 != 0 && remainingSeats != 0) {
            remainingSeats += (seatsPerRow - remainingSeats); // Ensure even seats in the last row
        }

        List<FormSeat> seatLayout = new ArrayList<>();
        int seatsCreated = 0;

        for (int rowNum = 1; rowNum <= maxRows && seatsCreated < requiredSeats; rowNum++) {
            String rowLetter = String.valueOf((char) ('A' + rowNum - 1));
            int columnsInThisRow = (rowNum <= fullRows) ? seatsPerRow : (remainingSeats > 0 ? remainingSeats : 0);
            if (columnsInThisRow > maxColumns) {
                throw new IllegalArgumentException(
                        String.format("Cannot create %d seats in row %s with max_columns = %d",
                                columnsInThisRow, rowLetter, maxColumns)
                );
            }

            // Left block: columns 1 to seatsPerBlock
            for (int col = 1; col <= seatsPerBlock && seatsCreated < requiredSeats; col++) {
                if (aisleColumn > 0 && col >= aisleColumn) break; // Skip aisle
                seatLayout.add(FormSeat.builder()
                        .screenId(null)
                        .seatNumber(rowLetter + col)
                        .row(rowLetter)
                        .column(col)
                        .isVariable(false)
                        .type(SeatType.STANDARD)
                        .build());
                seatsCreated++;
            }

            // Right block: columns after aisle
            for (int col = aisleColumn + 1; col <= maxColumns && seatsCreated < requiredSeats; col++) {
                if (seatsCreated >= requiredSeats) break;
                seatLayout.add(FormSeat.builder()
                        .screenId(null)
                        .seatNumber(rowLetter + col)
                        .row(rowLetter)
                        .column(col)
                        .isVariable(false)
                        .type(SeatType.STANDARD)
                        .build());
                seatsCreated++;
            }

            if (rowNum == fullRows && remainingSeats == 0) {
                break;
            }
        }

        // Validate even seats per row (per block)
        Map<String, Integer> seatsPerRowCount = new HashMap<>();
        for (FormSeat seat : seatLayout) {
            seatsPerRowCount.merge(seat.getRow(), 1, Integer::sum);
        }
        for (Map.Entry<String, Integer> entry : seatsPerRowCount.entrySet()) {
            if (entry.getValue() % 2 != 0) {
                throw new IllegalStateException("Generated layout has odd number of seats in row " + entry.getKey());
            }
        }

        return seatLayout;
    }

    @Override
    public void deleteScreen(Long id) {
        Screen screen = screenRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Screen not found"));
        if (screen.isDeleted()) {
            throw new RuntimeException("Screen is already deleted");
        }
        screen.setDeleted(true);
        screenRepository.save(screen);
    }

    @Override
    public Map<String, Object> suggestMaxColumns(int seatCapacity, int maxRows) {
        if (maxRows <= 0 || maxRows % 2 != 0) {
            throw new IllegalArgumentException("Max rows must be at least 1 and even");
        }
        if (seatCapacity < 50 || seatCapacity > 250) {
            throw new IllegalArgumentException("Seat capacity must be between 50 and 250");
        }
        int minColumns = (int) Math.ceil(50.0 / maxRows);
        if (minColumns % 2 != 0) minColumns++; // Ensure even
        int maxColumns = (int) Math.floor(250.0 / maxRows);
        if (maxColumns % 2 != 0) maxColumns--; // Ensure even
        int suggestedColumns = (int) Math.ceil((double) seatCapacity / maxRows);
        if (suggestedColumns % 2 != 0) suggestedColumns++; // Ensure even

        if (suggestedColumns < minColumns || suggestedColumns > maxColumns) {
            throw new IllegalArgumentException(
                    String.format("Cannot suggest valid columns for %d seats with %d rows. Columns must be between %d and %d.",
                            seatCapacity, maxRows, minColumns, maxColumns)
            );
        }

        Map<String, Object> response = new HashMap<>();
        response.put("suggestedColumns", suggestedColumns);
        int totalSeats = maxRows * suggestedColumns;
        response.put("totalSeats", totalSeats);
        if (totalSeats != seatCapacity) {
            response.put("message", String.format(
                    "Suggested layout (%d rows × %d columns = %d seats) has %d extra seat(s). Consider adjusting seat_capacity to %d.",
                    maxRows, suggestedColumns, totalSeats, totalSeats - seatCapacity, totalSeats
            ));
        }
        return response;
    }

    @Override
    public Map<String, Object> suggestMaxRows(int seatCapacity, int maxColumns) {
        if (maxColumns <= 0 || maxColumns % 2 != 0) {
            throw new IllegalArgumentException("Max columns must be at least 1 and even");
        }
        if (seatCapacity < 50 || seatCapacity > 250) {
            throw new IllegalArgumentException("Seat capacity must be between 50 and 250");
        }
        int minRows = (int) Math.ceil(50.0 / maxColumns);
        if (minRows % 2 != 0) minRows++; // Ensure even
        int maxRows = (int) Math.floor(250.0 / maxColumns);
        if (maxRows % 2 != 0) maxRows--; // Ensure even
        int suggestedRows = (int) Math.ceil((double) seatCapacity / maxColumns);
        if (suggestedRows % 2 != 0) suggestedRows++; // Ensure even

        if (suggestedRows < minRows || suggestedRows > maxRows) {
            throw new IllegalArgumentException(
                    String.format("Cannot suggest valid rows for %d seats with %d columns. Rows must be between %d and %d.",
                            seatCapacity, maxColumns, minRows, maxRows)
            );
        }

        Map<String, Object> response = new HashMap<>();
        response.put("suggestedRows", suggestedRows);
        int totalSeats = suggestedRows * maxColumns;
        response.put("totalSeats", totalSeats);
        if (totalSeats != seatCapacity) {
            response.put("message", String.format(
                    "Suggested layout (%d rows × %d columns = %d seats) has %d extra seat(s). Consider adjusting seat_capacity to %d.",
                    suggestedRows, maxColumns, totalSeats, totalSeats - seatCapacity, totalSeats
            ));
        }
        return response;
    }
}