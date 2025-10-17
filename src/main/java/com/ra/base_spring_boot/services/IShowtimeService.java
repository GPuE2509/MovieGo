package com.ra.base_spring_boot.services;

import com.ra.base_spring_boot.dto.req.FormShowtime;
import com.ra.base_spring_boot.dto.resp.AvailableDateResponse;
import com.ra.base_spring_boot.dto.resp.PageResponse;
import com.ra.base_spring_boot.dto.resp.ShowtimeResponse;
import com.ra.base_spring_boot.dto.resp.ShowtimeSeatResponse;
import com.ra.base_spring_boot.model.Showtime;
import org.springframework.data.domain.Page;

import java.util.Date;
import java.util.List;
import java.util.Optional;

public interface IShowtimeService {
    PageResponse<ShowtimeResponse> findByMovieId(Long movieId, int page, int size);
    PageResponse<ShowtimeResponse> findShowtimesByMovieIdAndTheater(Long movieId, Long theaterId, int page, int size, Date date);
    PageResponse<ShowtimeResponse> findShowtimesByMovieIdTheaterAndScreen(Long movieId, Long theaterId, Long screenId, int page, int size, Date date);
    List<AvailableDateResponse> getAvailableDatesByMovieIdAndTheater(Long movieId, Long theaterId);
    ShowtimeResponse createShowtime(FormShowtime form);
    ShowtimeResponse findById(Long id);
    void deleteShowtime(Long id);
    Optional<Showtime> findShowById(Long showtimeId);
    List<ShowtimeSeatResponse> getSeatsByShowtimeIdAndTheater(Long showtimeId, Long theaterId);
    List<ShowtimeResponse> findShowtimesByMovieAndTheaterAndDate(Long movieId, Long theaterId, Date date);
}