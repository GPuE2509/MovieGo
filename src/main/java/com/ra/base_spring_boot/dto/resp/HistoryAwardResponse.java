package com.ra.base_spring_boot.dto.resp;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class HistoryAwardResponse {
   private String timePayment;
   private String paymentMethod;
   private int Award;
}
