package com.ra.base_spring_boot.dto.req;

import com.ra.base_spring_boot.model.constants.SeatType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class FormSeat {
    @NotNull(message = "Screen ID cannot be null")
    @Schema(description = "ID of the associated screen", example = "1", required = true)
    private Long screenId;

    @NotBlank(message = "Seat number cannot be empty")
    @Schema(description = "Unique seat number", example = "A1", required = true)
    private String seatNumber;

    @NotBlank(message = "Row cannot be empty")
    @Schema(description = "Row identifier for the seat", example = "A", required = true)
    private String row;

    @Min(value = 1, message = "Column must be at least 1")
    @Schema(description = "Column number for the seat", example = "1", required = true)
    private Integer column;

    @NotNull(message = "Variable status cannot be null")
    @Schema(description = "Whether the seat is variable", example = "false", required = true)
    private Boolean isVariable;

    @NotNull(message = "Seat type cannot be null")
    @Schema(description = "Type of the seat", example = "STANDARD", required = true)
    private SeatType type;

    @Schema(description = "ID of the associated showtime", example = "42", required = true)
    private Long showtimeId;
}