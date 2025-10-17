package com.ra.base_spring_boot.dto.req;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.ra.base_spring_boot.model.constants.SeatType;
import com.ra.base_spring_boot.model.constants.MovieType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.*;
import java.sql.Time;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class FormTicketPrice {
    @NotNull(message = "Seat type cannot be null")
    @Schema(description = "Type of seat", example = "STANDARD", required = true)
    private SeatType typeSeat;

    @NotNull(message = "Movie type cannot be null")
    @Schema(description = "Type of movie", example = "_2D", required = true)
    private MovieType typeMovie;

    @NotNull(message = "Price cannot be null")
    @PositiveOrZero(message = "Price cannot be negative")
    @Schema(description = "Price of the ticket", example = "80000.0", required = true)
    private Double price;

    @Schema(description = "Day type: false for regular days (Mon-Fri), true for special days (weekends/holidays)", example = "false")
    private boolean dayType;

    @NotNull(message = "Start time cannot be null")
    @JsonFormat(pattern = "HH:mm:ss")
    @Schema(description = "Start time of the price validity", example = "08:00:00", required = true)
    private Time startTime;

    @NotNull(message = "End time cannot be null")
    @JsonFormat(pattern = "HH:mm:ss")
    @Schema(description = "End time of the price validity", example = "23:59:59", required = true)
    private Time endTime;
}