package com.ra.base_spring_boot.dto.req;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class FormForgotPassword {
    @NotBlank(message = "Email cannot be empty")
    @Email(message = "Email format is invalid")
    @Schema(description = "User's email address for password reset", example = "user@example.com", required = true)
    private String email;
}
