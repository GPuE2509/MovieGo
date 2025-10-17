package com.ra.base_spring_boot.dto.req;

import com.ra.base_spring_boot.model.constants.MovieType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.multipart.MultipartFile;

import java.util.Date;
import java.util.Set;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class FormMovie {
    @NotBlank(message = "Title cannot be empty")
    @Size(max = 255, message = "Title cannot exceed 255 characters")
    @Schema(description = "Title of the movie", example = "Inception", required = true)
    private String title;

    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    @Schema(description = "Description of the movie", example = "A mind-bending thriller...", required = false)
    private String description;

    @NotBlank(message = "Author cannot be empty")
    @Size(max = 100, message = "Author cannot exceed 100 characters")
    @Schema(description = "Author or director of the movie", example = "Christopher Nolan", required = true)
    private String author;

    @Size(max = 1000, message = "Actors list cannot exceed 1000 characters")
    @Schema(description = "List of actors in the movie", example = "Leonardo DiCaprio, Ellen Page", required = false)
    private String actors;

    @Size(max = 100, message = "Nation cannot exceed 100 characters")
    @Schema(description = "Nation or country of the movie", example = "USA", required = false)
    private String nation;

    @Schema(description = "Movie image file", required = false)
    private MultipartFile image;

    @Schema(description = "Trailer URL or path", example = "https://youtube.com/watch?v=example", required = false)
    private String trailer;

    @NotNull(message = "Type cannot be null")
    @Schema(description = "Type of the movie", example = "3D", required = true)
    private MovieType type;

    @NotNull(message = "Duration cannot be null")
    @Schema(description = "Duration in minutes", example = "148", required = true)
    private Integer duration;

    @NotNull(message = "Release date cannot be null")
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    @Schema(description = "Release date of the movie", example = "2023-06-16", required = true)
    private Date releaseDate;

    @Schema(description = "IDs of associated genres", example = "[1, 2, 3]", required = false)
    private Set<Long> genreIds;
}
