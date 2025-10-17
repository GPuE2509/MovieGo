package com.ra.base_spring_boot.dto.resp;

import lombok.*;

import java.util.Map;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class ExchangeRateResponse {
    private String result;
    private String time_last_updated;
    private Map<String, Double> conversion_rates;
}
