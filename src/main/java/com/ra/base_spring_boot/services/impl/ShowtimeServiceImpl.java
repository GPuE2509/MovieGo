package com.ra.base_spring_boot.services.impl;

import com.ra.base_spring_boot.dto.req.FormShowtime;
import com.ra.base_spring_boot.dto.resp.AvailableDateResponse;
import com.ra.base_spring_boot.dto.resp.PageResponse;
import com.ra.base_spring_boot.dto.resp.ShowtimeResponse;
import com.ra.base_spring_boot.dto.resp.ShowtimeSeatResponse;
import com.ra.base_spring_boot.model.Movie;
import com.ra.base_spring_boot.model.Screen;
import com.ra.base_spring_boot.model.Seat;
import com.ra.base_spring_boot.model.Showtime;
import com.ra.base_spring_boot.repository.*;
import com.ra.base_spring_boot.services.IShowtimeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ShowtimeServiceImpl implements IShowtimeService {

    private final IShowtimeRepository showtimeRepository;
    private final IMovieRepository movieRepository;
    private final IScreenRepository screenRepository;
    private final ISeatRepository seatRepository;
    private final IBookingSeatRepository bookingSeatRepository;

    @Override
    public PageResponse<ShowtimeResponse> findByMovieId(Long movieId, int page, int size) {
        Page<Showtime> showtimes = showtimeRepository.findByMovieId(movieId, PageRequest.of(page, size));
        return mapToPageResponse(showtimes);
    }

    @Override
    public PageResponse<ShowtimeResponse> findShowtimesByMovieIdAndTheater(Long movieId, Long theaterId, int page, int size, Date date) {
        try {
            if (movieId == null || movieId <= 0) {
                throw new IllegalArgumentException("Invalid movieId: " + movieId);
            }
            if (page < 0 || size <= 0) {
                throw new IllegalArgumentException("Invalid page or size parameters: page=" + page + ", size=" + size);
            }

            Page<Showtime> showtimes = showtimeRepository.findByMovieIdAndTheaterAndDate(movieId, theaterId, date, PageRequest.of(page, size));
            return mapToPageResponse(showtimes);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid input parameters for movie ID: " + movieId, e);
            return PageResponse.<ShowtimeResponse>builder()
                    .data(Collections.emptyList())
                    .page(page)
                    .size(size)
                    .total(0L)
                    .totalPages(0)
                    .hasPrevious(false)
                    .hasNext(false)
                    .build();
        } catch (Exception e) {
            log.error("Error fetching showtimes for movie ID: " + movieId, e);
            return PageResponse.<ShowtimeResponse>builder()
                    .data(Collections.emptyList())
                    .page(page)
                    .size(size)
                    .total(0L)
                    .totalPages(0)
                    .hasPrevious(false)
                    .hasNext(false)
                    .build();
        }
    }

    @Override
    public List<AvailableDateResponse> getAvailableDatesByMovieIdAndTheater(Long movieId, Long theaterId) {
        try {
            ZoneId zoneId = ZoneId.of("Asia/Ho_Chi_Minh");
            ZonedDateTime now = ZonedDateTime.now(zoneId);
            Date fromDate = Date.from(now.toLocalDate().atStartOfDay(zoneId).toInstant());
            Date toDate = Date.from(now.plusDays(30).toLocalDate().atStartOfDay(zoneId).toInstant());

            List<Showtime> showtimes = showtimeRepository.findShowtimesBetweenDates(fromDate, toDate).stream()
                    .filter(s -> theaterId == null || s.getScreen().getTheater().getId().equals(theaterId))
                    .filter(s -> s.getMovie().getId().equals(movieId))
                    .collect(Collectors.toList());

            if (showtimes.isEmpty()) {
                log.warn("No available dates found for movie ID: " + movieId);
                return Collections.emptyList();
            }

            return showtimes.stream()
                    .map(showtime -> {
                        ZonedDateTime zonedStartTime = ZonedDateTime.ofInstant(showtime.getStartTime().toInstant(), zoneId);
                        return AvailableDateResponse.builder()
                                .date(Date.from(zonedStartTime.toInstant()))
                                .build();
                    })
                    .distinct()
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error fetching available dates for movie ID: " + movieId, e);
            return Collections.emptyList();
        }
    }

    @Override
    public ShowtimeResponse createShowtime(FormShowtime form) {
        Screen screen = screenRepository.findById(form.getScreenId())
                .orElseThrow(() -> new RuntimeException("Screen not found with ID: " + form.getScreenId()));
        Movie movie = movieRepository.findById(form.getMovieId())
                .orElseThrow(() -> new RuntimeException("Movie not found with ID: " + form.getMovieId()));

        if (movie.getReleaseDate() != null && form.getStartTime().before(movie.getReleaseDate())) {
            throw new IllegalArgumentException(
                    String.format("Movie \"%s\" will be released on %s. Cannot schedule before release date.",
                            movie.getTitle(), movie.getReleaseDate())
            );
        }

        List<Showtime> existingShowtimes = showtimeRepository.findByScreenId(form.getScreenId());
        for (Showtime existing : existingShowtimes) {
            if (form.getStartTime().before(existing.getEndTime()) &&
                    form.getEndTime().after(existing.getStartTime())) {
                throw new IllegalArgumentException(
                        String.format("Showtime overlaps with existing showtime [ID: %d, Start: %s, End: %s] for screen %s",
                                existing.getId(), existing.getStartTime(), existing.getEndTime(), screen.getName())
                );
            }
        }

        long diffMillis = form.getEndTime().getTime() - form.getStartTime().getTime();
        long diffMinutes = diffMillis / (60 * 1000);
        if (diffMinutes + 15 != movie.getDuration()) {
            throw new IllegalArgumentException(
                    String.format("Showtime duration mismatch: start-end + 15 minutes must equal movie duration (%d minutes).",
                            movie.getDuration())
            );
        }

        Showtime showtime = Showtime.builder()
                .screen(screen)
                .movie(movie)
                .startTime(form.getStartTime())
                .endTime(form.getEndTime())
                .build();
        showtime = showtimeRepository.save(showtime);

        return mapToShowtimeResponse(showtime);
    }

    @Override
    public ShowtimeResponse findById(Long id) {
        Showtime showtime = showtimeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Showtime not found with ID: " + id));
        return mapToShowtimeResponse(showtime);
    }

    @Override
    public void deleteShowtime(Long id) {
        Showtime showtime = showtimeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Showtime not found with ID: " + id));
        showtimeRepository.delete(showtime);
    }

    @Override
    public Optional<Showtime> findShowById(Long showtimeId) {
        return showtimeRepository.findById(showtimeId);
    }

    @Override
    public List<ShowtimeSeatResponse> getSeatsByShowtimeIdAndTheater(Long showtimeId, Long theaterId) {
        Showtime showtime = showtimeRepository.findById(showtimeId)
                .orElseThrow(() -> new RuntimeException("Showtime not found with ID: " + showtimeId));

        if (theaterId != null && !showtime.getScreen().getTheater().getId().equals(theaterId)) {
            throw new RuntimeException("Theater ID does not match the showtime's theater");
        }

        List<Seat> allSeats = seatRepository.findByScreen(showtime.getScreen());
        List<Long> bookedSeatIds = bookingSeatRepository.findBookedSeatIdsByShowtime(showtimeId);

        return allSeats.stream()
                .map(seat -> ShowtimeSeatResponse.builder()
                        .id(seat.getId())
                        .seatNumber(seat.getSeatNumber())
                        .type(seat.getType())
                        .isTaken(bookedSeatIds.contains(seat.getId()))
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public List<ShowtimeResponse> findShowtimesByMovieAndTheaterAndDate(Long movieId, Long theaterId, Date date) {
        ZoneId zone = ZoneId.of("Asia/Ho_Chi_Minh");
        LocalDate localDate = date.toInstant().atZone(zone).toLocalDate();
        Date startOfDay = Date.from(localDate.atStartOfDay(zone).toInstant());
        Date endOfDay = Date.from(localDate.plusDays(1).atStartOfDay(zone).toInstant());

        List<Showtime> showtimes = showtimeRepository
                .findByMovieIdAndTheaterAndDate(movieId, theaterId, startOfDay, endOfDay);

        return showtimes.stream()
                .map(this::mapToShowtimeResponse)
                .collect(Collectors.toList());
    }

    @Override
    public PageResponse<ShowtimeResponse> findShowtimesByMovieIdTheaterAndScreen(Long movieId, Long theaterId, Long screenId, int page, int size, Date date) {
        try {
            Page<Showtime> showtimes;
            if (screenId != null) {
                showtimes = showtimeRepository.findByMovieIdAndScreenId(movieId, screenId, PageRequest.of(page, size));
            } else if (theaterId != null) {
                showtimes = showtimeRepository.findByMovieIdAndTheaterAndDate(movieId, theaterId, date, PageRequest.of(page, size));
            } else {
                showtimes = showtimeRepository.findByMovieId(movieId, PageRequest.of(page, size));
            }
            return mapToPageResponse(showtimes);
        } catch (Exception e) {
            log.error("Error fetching showtimes", e);
            return PageResponse.<ShowtimeResponse>builder()
                    .data(Collections.emptyList())
                    .build();
        }
    }

    private ShowtimeResponse mapToShowtimeResponse(Showtime showtime) {
        return ShowtimeResponse.builder()
                .id(showtime.getId())
                .screenId(showtime.getScreen().getId())
                .movieId(showtime.getMovie().getId())
                .theaterName(showtime.getScreen().getTheater().getName())
                .startTime(showtime.getStartTime())
                .endTime(showtime.getEndTime())
                .availableSeats(showtime.calculateAvailableSeats())
                .build();
    }

    private PageResponse<ShowtimeResponse> mapToPageResponse(Page<Showtime> showtimes) {
        return PageResponse.<ShowtimeResponse>builder()
                .data(showtimes.getContent().stream()
                        .map(this::mapToShowtimeResponse)
                        .collect(Collectors.toList()))
                .page(showtimes.getNumber())
                .size(showtimes.getSize())
                .total(showtimes.getTotalElements())
                .totalPages(showtimes.getTotalPages())
                .hasPrevious(showtimes.hasPrevious())
                .hasNext(showtimes.hasNext())
                .build();
    }
}