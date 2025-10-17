package com.ra.base_spring_boot.dto.resp;


import com.ra.base_spring_boot.model.base.BaseObject;
import com.ra.base_spring_boot.model.constants.BannerType;
import lombok.*;


@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class BannerResponse extends BaseObject {
    private Long id;
    private BannerType type;
    private String url;
    private String position;
    private String message;
}
