package com.ra.base_spring_boot.dto.resp;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class TicketCountDto {
    private Long id; // Theater ID or Movie ID
    private Long ticketCount;
}
