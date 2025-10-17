package com.ra.base_spring_boot.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.ra.base_spring_boot.model.base.BaseObject;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import lombok.*;

import java.util.Date;
import java.util.Set;

@Entity
@Table(name = "coupons")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class Coupon extends BaseObject {

    @Column( name="coupon_name",length = 100,nullable = false)
    private String name;

    @Column( name="coupon_code",length = 100,nullable = false, unique = true)
    private String code;

    @Min(value = 0, message = "Value must be >= 0")
    @Column( name="coupon_value",nullable = false)
    private Long value;

    @Min(value = 0, message = "Exchange point must be >= 0")
    @Column(nullable = false)
    private Long exchange_point;

    @Column(name = "created_at")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX", timezone = "Asia/Ho_Chi_Minh")
    private Date createdAt;

    @Column(name = "updated_at")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX", timezone = "Asia/Ho_Chi_Minh")
    private Date updatedAt;


}
