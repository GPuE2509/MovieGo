package com.ra.base_spring_boot.dto.req;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.*;

import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class FormScreen {
    @NotBlank(message = "Screen name cannot be blank")
    @Size(max = 100, message = "Screen name cannot exceed 100 characters")
    @Schema(description = "Name of the screen", example = "Screen 1", required = true)
    private String name;

    @Min(value = 50, message = "Seat capacity must be at least 50")
    @Max(value = 250, message = "Seat capacity cannot exceed 250")
    @Schema(description = "Number of seats in the screen", example = "200", required = true)
    private Integer seat_capacity;

    @Positive(message = "Theater ID must be positive")
    @Schema(description = "ID of the associated theater", example = "1", required = true)
    private Long theater_id;

    @NotNull(message = "Max rows cannot be null")
    @Min(value = 1, message = "Max rows must be at least 1")
    @Schema(description = "Maximum number of rows", example = "10", required = true)
    private Integer max_rows;

    @NotNull(message = "Max columns cannot be null")
    @Min(value = 1, message = "Max columns must be at least 1")
    @Schema(description = "Maximum number of columns", example = "15", required = true)
    private Integer max_columns;

    @Schema(description = "Layout of seats with type", example = "[{seatNumber: 'A1', row: 'A', column: 1, type: 'STANDARD'}]")
    private List<FormSeat> seat_layout;
}