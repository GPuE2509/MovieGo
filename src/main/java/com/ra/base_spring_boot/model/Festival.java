package com.ra.base_spring_boot.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.ra.base_spring_boot.model.base.BaseObject;
import jakarta.persistence.*;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.Date;

@Entity
@Table(name = "festivals")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class Festival extends BaseObject {

    @NotBlank(message = "Title cannot be blank")
    @Column(nullable = false)
    private String title;

    @Column( nullable = false)
    private String image;

    @Column(name = "location")
    private String location;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @FutureOrPresent(message = "The start time must be from now on.")
    @Column(name = "start_time", nullable = false)
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX", timezone = "Asia/Ho_Chi_Minh")
    private Date startTime;

    @Column(name = "end_time", nullable = false)
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX", timezone = "Asia/Ho_Chi_Minh")
    private Date endTime;

    @PrePersist
    @PreUpdate
    private void validateDates() {
        if (endTime != null && startTime != null && endTime.before(startTime)) {
            throw new IllegalArgumentException("The end time must not be less than the start time.");
        }
    }
}