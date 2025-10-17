package com.ra.base_spring_boot.dto.req;

import com.ra.base_spring_boot.model.base.BaseObject;
import com.ra.base_spring_boot.model.constants.BannerType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.*;
import org.springframework.web.multipart.MultipartFile;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class FormBanner extends BaseObject {

    @NotNull(message = "Banner type cannot be null")
    @Schema(description = "Type of the banner", example = "PROMOTION", required = true)
    private BannerType type;

    @NotNull(message = "Banner file cannot be null")
    @Schema(description = "Banner image file", required = true)
    private MultipartFile file;

    @NotBlank(message = "Position cannot be blank")
    @Schema(description = "Position of the banner on the page", example = "TOP", required = true)
    private String position;
}
