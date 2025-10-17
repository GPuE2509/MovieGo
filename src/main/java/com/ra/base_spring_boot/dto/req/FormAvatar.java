package com.ra.base_spring_boot.dto.req;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.springframework.web.multipart.MultipartFile;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class FormAvatar {
    @NotNull(message = "avatar file cannot be null")
    @Schema(description = "Avatar image file", required = false)
    private MultipartFile avatar;
}
