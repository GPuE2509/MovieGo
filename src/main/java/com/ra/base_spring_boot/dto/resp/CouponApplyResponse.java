package com.ra.base_spring_boot.dto.resp;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class CouponApplyResponse {
    private double finalAmount;
    private double discountAmount;
}
