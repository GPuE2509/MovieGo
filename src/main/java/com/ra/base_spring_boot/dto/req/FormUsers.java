package com.ra.base_spring_boot.dto.req;

import com.ra.base_spring_boot.model.constants.UserStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.Date;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class FormUsers {
    @NotNull(message = "Status cannot be null")
    @Schema(description = "User status", example = "BLOCKED", required = true)
    private UserStatus status;

    @Schema(description = "Ban until date (for BLOCKED status)", example = "2025-12-31T23:59:59.999Z")
    private Date banUntil;
}
