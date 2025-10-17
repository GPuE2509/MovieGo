package com.ra.base_spring_boot.dto.resp;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class TheaterResponse {
    private Long id;
    private String name;
    private String location;
    private String phone;
    private String state;
    private String imageUrl;
}
