package com.ra.base_spring_boot.dto.resp;

import lombok.*;

import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class TicketStatisticsResponse {
    private Long totalTicketsSold;
    private List<TicketCountDto> ticketsPerTheater; // List of theater ID -> ticket count
    private List<TicketCountDto> ticketsPerMovie;   // List of movie ID -> ticket count
}