package com.ra.base_spring_boot.dto.resp;

import com.ra.base_spring_boot.model.constants.SeatType;
import com.ra.base_spring_boot.model.constants.MovieType;
import lombok.*;
import java.sql.Time;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class TicketPriceResponse {
    private Long id;
    private SeatType typeSeat;
    private MovieType typeMovie;
    private Double price;
    private boolean dayType;
    private Time startTime;
    private Time endTime;
}