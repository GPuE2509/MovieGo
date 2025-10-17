package com.ra.base_spring_boot.services;

import com.ra.base_spring_boot.dto.req.FormSeat;
import com.ra.base_spring_boot.dto.resp.RowSeatResponse;
import com.ra.base_spring_boot.dto.resp.SeatResponse;
import com.ra.base_spring_boot.dto.resp.PageResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ISeatService {
    PageResponse<SeatResponse> getAllSeats(String keyword, Pageable pageable);
    SeatResponse createSeat(FormSeat formSeat);
    SeatResponse updateSeat(Long id, FormSeat formSeat);
    void deleteSeat(Long id);
    List<RowSeatResponse> getSeatStatusByShowtimeAndTheater(Long showtimeId, Long theaterId);
    PageResponse<SeatResponse> getAllDeletedSeats(String keyword, Pageable pageable);
    SeatResponse restoreSeat(Long id);
    List<RowSeatResponse> getAdminSeatStatusByShowtimeAndTheater(Long showtimeId, Long theaterId);
}
