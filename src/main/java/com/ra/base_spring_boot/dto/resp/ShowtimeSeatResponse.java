package com.ra.base_spring_boot.dto.resp;

import com.ra.base_spring_boot.model.constants.SeatType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class ShowtimeSeatResponse {
    private Long id;
    private String seatNumber;
    private SeatType type;
    private boolean isTaken;
}