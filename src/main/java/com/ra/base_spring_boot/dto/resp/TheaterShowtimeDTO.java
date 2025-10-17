package com.ra.base_spring_boot.dto.resp;

import com.ra.base_spring_boot.model.constants.MovieType;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.Set;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class TheaterShowtimeDTO {
    private Long theaterId;
    private String theaterName;
    private String theaterState;
    private String location;
    @Pattern(regexp = "^[0-9]{8,11}$", message = "Phone number must be from 8 to 11 digits")
    private String phone;
    private Long screenId;
    private String screenName;
    @Min(value = 0, message = "Number of seats must not be less than 0")
    private Integer seatCapacity;
    private Long showtimeId;
    private Long movieId;
    @NotBlank(message = "Movie name cannot be blank")
    private String movieTitle;
    private String movieDescription;
    private String movieAuthor;
    private String movieActors;
    private String movieImage;
    private String movieTrailer;
    private String movieType;
    private Integer movieDuration;
    private String movieNations;
    private LocalDate movieReleaseDate;
    private LocalDateTime movieCreatedAt;
    private LocalDateTime movieUpdatedAt;
    private Set<String> genreNames;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Double latitude;
    private Double longitude;
    private double distance;
}