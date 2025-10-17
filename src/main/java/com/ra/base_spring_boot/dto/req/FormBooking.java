package com.ra.base_spring_boot.dto.req;

import lombok.*;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class FormBooking {
    private Long showtimeId;
    private List<Long> seatIds;
    private Long paymentMethodId;
}
