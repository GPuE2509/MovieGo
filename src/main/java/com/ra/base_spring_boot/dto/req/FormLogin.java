package com.ra.base_spring_boot.dto.req;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class FormLogin
{
    @NotBlank(message = "Email cannot be empty")
    @Schema(description = "User's email address", example = "user@movie.com", required = true)
    private String email;

    @NotBlank(message = "Password cannot be empty")
    @Schema(description = "User's password", example = "123456", required = true)
    private String password;
}
