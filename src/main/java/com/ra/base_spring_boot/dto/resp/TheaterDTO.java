package com.ra.base_spring_boot.dto.resp;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class TheaterDTO {
    private Long id;
    private String name;
    private String state;
    private String location;
    private String phone;
    private Double latitude;
    private Double longitude;
    private double distance;
    private String imageUrl;
}
