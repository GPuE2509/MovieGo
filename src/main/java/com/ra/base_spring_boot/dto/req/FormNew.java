package com.ra.base_spring_boot.dto.req;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Date;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class FormNew {
    @Schema(description = "Title of the news", example = "New Movie Release", required = false)
    private String title;

    @Schema(description = "Content of the news", example = "Details about the new release...", required = false)
    private String content;

    @Schema(description = "New image file")
    private MultipartFile image;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX", timezone = "Asia/Ho_Chi_Minh")
    @Schema(description = "Creation date of the news", example = "2025-06-23T09:00:00.000Z", required = false)
    private Date createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX", timezone = "Asia/Ho_Chi_Minh")
    @Schema(description = "Last updated date of the news", example = "2025-06-23T10:00:00.000Z", required = false)
    private Date updatedAt;
}
