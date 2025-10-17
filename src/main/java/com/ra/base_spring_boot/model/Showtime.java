package com.ra.base_spring_boot.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.ra.base_spring_boot.model.base.BaseObject;
import jakarta.persistence.*;
import lombok.*;

import java.util.Date;
import java.util.List;

@Entity
@Table(name = "showtimes")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class Showtime extends BaseObject {
    @ManyToOne(optional = false)
    @JoinColumn(name = "screen_id", referencedColumnName = "id", nullable = false)
    private Screen screen;

    @ManyToOne(optional = false)
    @JoinColumn(name = "movie_id", referencedColumnName = "id", nullable = false)
    private Movie movie;

    @Column(name = "start_time", nullable = false)
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX", timezone = "Asia/Ho_Chi_Minh")
    private Date startTime;

    @Column(name = "end_time", nullable = false)
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX", timezone = "Asia/Ho_Chi_Minh")
    private Date endTime;

    @Column(name = "created_at")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX", timezone = "Asia/Ho_Chi_Minh")
    private Date createdAt;

    @Column(name = "updated_at")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX", timezone = "Asia/Ho_Chi_Minh")
    private Date updatedAt;

    @OneToMany(mappedBy = "showtime", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Booking> bookings;

    @Transient
    private Integer availableSeats;

    @PrePersist
    protected void onCreate() {
        Date now = new Date();
        validateTimes();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        validateTimes();
        this.updatedAt = new Date();
    }

    private void validateTimes() {
        Date now = new Date();
        if (startTime == null || startTime.before(now)) {
            throw new IllegalArgumentException("Start time must not be in the past.");
        }
        if (endTime == null || endTime.before(startTime)) {
            throw new IllegalArgumentException("End time must be after start time.");
        }
    }

    public Integer calculateAvailableSeats() {
        if (screen == null || screen.getSeatCapacity() == 0) return 0;

        int bookedSeats = bookings != null ?
                bookings.stream().mapToInt(Booking::getTotalSeat).sum() : 0;

        return screen.getSeatCapacity() - bookedSeats;
    }
}