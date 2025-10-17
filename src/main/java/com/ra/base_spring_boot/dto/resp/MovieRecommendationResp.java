package com.ra.base_spring_boot.dto.resp;

import lombok.*;

import java.util.Date;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class MovieRecommendationResp {
    private Long id;
    private String title;
    private String image;
    private String genre;
    private Date releaseDate;
}
