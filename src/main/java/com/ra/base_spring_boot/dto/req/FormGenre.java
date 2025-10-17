package com.ra.base_spring_boot.dto.req;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class FormGenre {
    @Pattern( regexp = "^\\S+ \\S+$", message = "Genre name must be in the format \"FirstName LastName\"")
    @NotBlank(message = "Genre name cannot be empty")
    @Size(max = 100, message = "Genre name cannot exceed 100 characters")
    @Schema(description = "Name of the genre", example = "Action", required = true)
    private String genreName;
}
