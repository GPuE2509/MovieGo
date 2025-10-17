package com.ra.base_spring_boot.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.ra.base_spring_boot.model.base.BaseObject;
import com.ra.base_spring_boot.model.constants.SeatType;
import com.ra.base_spring_boot.model.constants.MovieType;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import lombok.*;

import java.sql.Time;

@Entity
@Table(name = "ticket_prices")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class TicketPrice extends BaseObject {

    @Enumerated(EnumType.STRING)
    @Column(name = "type_seat", nullable = false)
    private SeatType typeSeat;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_movie", nullable = false)
    private MovieType typeMovie;

    @Min(value = 0, message = "Ticket price cannot be less than 0")
    @Column(nullable = false)
    private double price;

    @Column(name = "day_type", nullable = false)
    private boolean dayType;

    @JsonFormat(pattern = "HH:mm:ss")
    @Column(name = "start_time", nullable = false)
    private Time startTime;

    @JsonFormat(pattern = "HH:mm:ss")
    @Column(name = "end_time", nullable = false)
    private Time endTime;
}