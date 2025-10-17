package com.ra.base_spring_boot.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.ra.base_spring_boot.model.base.BaseObject;
import com.ra.base_spring_boot.model.constants.SeatType;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

import java.util.Date;

@Entity
@Table(name = "seats", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"screen_id", "row_seat", "column_seat"})
})
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class Seat extends BaseObject {

    @ManyToOne(optional = false)
    @JoinColumn(name = "screen_id", referencedColumnName = "id", nullable = false)
    private Screen screen;

    @NotBlank(message = "Seats cannot be left empty")
    @Column(name = "seat_number", length = 50, nullable = false)
    private String seatNumber;

    @NotBlank(message = "Row cannot be empty")
    @Column(name = "row_seat", length = 10, nullable = false)
    private String row;

    @Min(value = 1, message = "Column must be at least 1")
    @Column(name = "column_seat", nullable = false)
    @ColumnDefault("1")
    @Builder.Default
    private Integer column = 1;

    @Column(name = "is_variable", nullable = false)
    private boolean isVariable;

    @Column(name = "is_deleted", nullable = false)
    @Builder.Default
    private boolean deleted = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SeatType type;

    @Column(name = "created_at")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX", timezone = "Asia/Ho_Chi_Minh")
    private Date createdAt;

    @Column(name = "updated_at")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX", timezone = "Asia/Ho_Chi_Minh")
    private Date updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = new Date();
        this.updatedAt = new Date();
        this.isVariable = false;
        if (this.row != null && this.column != null) {
            this.seatNumber = this.row + this.column;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = new Date();
        if (this.row != null && this.column != null) {
            this.seatNumber = this.row + this.column;
        }
    }
}