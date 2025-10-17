package com.ra.base_spring_boot.dto.req;

import org.springframework.web.multipart.MultipartFile;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class FormTheater {

    @NotBlank(message = "Name cannot be empty")
    @Size(max = 100, message = "Name must not exceed 100 characters")
    @Schema(description = "Name of the theater", example = "Cinema World", required = true)
    private String name;

    @NotBlank(message = "Location cannot be empty")
    @Schema(description = "Location of the theater", example = "123 Movie St, Hanoi", required = true)
    private String location;

    @NotBlank(message = "Phone cannot be empty")
    @Size(min = 8, max = 11, message = "Phone must be 10 or 11 digits")
    @Pattern(regexp = "^[0-9]{8,11}$", message = "Phone number must be from 8 to 11 digits")
    @Schema(description = "Phone number of the theater", example = "19006017", required = true)
    private String phone;

    @NotNull(message = "Latitude is required")
    @Schema(description = "Latitude of the theater", example = "10.8015", required = true)
    private Double latitude;

    @NotNull(message = "Longitude is required")
    @Schema(description = "Longitude of the theater", example = "106.6367", required = true)
    private Double longitude;

    @NotBlank(message = "State cannot be empty")
    @Size(max = 50, message = "State must not exceed 50 characters")
    @Schema(description = "State or province of the theater", example = "Ho Chi Minh City", required = true)
    private String state;

    @Schema(description = "Image file of the theater", type = "string", format = "binary", required = true)
    private MultipartFile image;

    @Schema(description = "URL của ảnh rạp chiếu phim (chỉ để hiển thị)", example = "http://example.com/image.jpg")
    private String imageUrl;
}
