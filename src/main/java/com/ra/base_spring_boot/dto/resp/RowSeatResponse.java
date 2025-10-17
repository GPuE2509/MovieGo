package com.ra.base_spring_boot.dto.resp;

import lombok.*;

import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class RowSeatResponse {
    private String row;
    private List<SeatStatusResponse> seats;
}
