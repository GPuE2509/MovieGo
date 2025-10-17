package com.ra.base_spring_boot.dto.req;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class FormChangePassword {
    @NotBlank(message = "Old password is required")
    private String oldPassword;

    @Size(min = 6, max = 255, message = "Password must be between 6 and 255 characters")
    @NotBlank(message = "New password is required")
    private String newPassword;

    @Size(min = 6, max = 255, message = "Password must be between 6 and 255 characters")
    @NotBlank(message = "Confirm new password is required")
    private String confirmNewPassword;
}
