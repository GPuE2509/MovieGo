package com.ra.base_spring_boot.dto.resp;

import com.ra.base_spring_boot.model.constants.BookingStatus;
import lombok.*;

import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class SeatBookingMessage {
    private Long showtimeId;
    private List<Long> seatIds;
    private BookingStatus status;
    private boolean isBlocked;
}
