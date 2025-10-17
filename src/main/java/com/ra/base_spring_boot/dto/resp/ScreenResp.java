package com.ra.base_spring_boot.dto.resp;


import com.fasterxml.jackson.annotation.JsonFormat;
import com.ra.base_spring_boot.model.Theater;
import lombok.*;

import java.util.Date;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class ScreenResp {
    private Long id;
    private String name;
    private int seatCapacity;
    private Theater theater;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX", timezone = "Asia/Ho_Chi_Minh")
    private Date createdAt;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX", timezone = "Asia/Ho_Chi_Minh")
    private Date updatedAt;
    private Integer maxRows;
    private Integer maxColumns;
}