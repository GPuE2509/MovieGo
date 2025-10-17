package com.ra.base_spring_boot.dto.req;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class FormResetPassword {
    @NotBlank(message = "New password cannot be empty")
    @Schema(description = "New password for the user", example = "newpassword123", required = true)
    private String newPassword;
}