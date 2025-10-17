package com.ra.base_spring_boot.dto.resp;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class SeatStatusResponse {
    private Long seatId;
    private String seatNumber;
    private String seatType;
    private boolean isBooked;
    private double price;
    private Integer seatCapacity;
    private boolean deleted;
}
