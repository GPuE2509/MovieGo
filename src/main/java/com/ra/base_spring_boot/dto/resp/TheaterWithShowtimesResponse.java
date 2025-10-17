package com.ra.base_spring_boot.dto.resp;

import lombok.*;

import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class TheaterWithShowtimesResponse {
    private TheaterResponse theater;
    private List<ShowtimeResponse> showtimes;
    private double distance;
}
