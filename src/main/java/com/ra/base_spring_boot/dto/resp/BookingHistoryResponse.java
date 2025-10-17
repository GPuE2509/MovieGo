package com.ra.base_spring_boot.dto.resp;

import lombok.*;

import java.util.Date;
import java.util.Set;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class BookingHistoryResponse {
    private Date paymentTime;
    private String movieName;
    private Set<String> numberSeat;
    private double totalPriceMovie;
}
