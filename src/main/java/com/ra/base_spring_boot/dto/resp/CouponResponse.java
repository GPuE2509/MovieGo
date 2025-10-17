package com.ra.base_spring_boot.dto.resp;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class CouponResponse {
    private Long id;
    private String name;
    private String code;
    private Long value;
    private Long exchange_point;
    private boolean canExchange;
}
