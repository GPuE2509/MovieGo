package com.ra.base_spring_boot.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.ra.base_spring_boot.model.base.BaseObject;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import lombok.*;

import java.util.Date;

@Entity
@Table(name = "screens")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class Screen extends BaseObject {
    @Column(name = "name", length = 100)
    private String name;

    @Min(value = 0, message = "Number of seats must not be less than 0")
    @Column(name = "seat_capacity")
    private Integer seatCapacity;

    @Min(value = 0, message = "Number of rows must not be less than 0")
    @Column(name = "max_rows", nullable = false)
    private Integer maxRows;

    @Min(value = 0, message = "Number of columns must not be less than 0")
    @Column(name = "max_columns", nullable = false)
    private Integer maxColumns;

    @ManyToOne
    @JoinColumn(name = "theater_id", referencedColumnName = "id", nullable = false)
    private Theater theater;

    @Column(name = "is_deleted", nullable = false)
    @Builder.Default
    private boolean deleted = false;

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
        if (this.maxRows == null) {
            this.maxRows = 0;
        }
        if (this.maxColumns == null) {
            this.maxColumns = 0;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = new Date();
    }
}