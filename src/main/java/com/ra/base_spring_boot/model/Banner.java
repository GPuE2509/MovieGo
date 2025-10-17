package com.ra.base_spring_boot.model;

import com.ra.base_spring_boot.model.base.BaseObject;
import com.ra.base_spring_boot.model.constants.BannerType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Entity
@Table(name = "banners")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class Banner extends BaseObject {
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BannerType type;

    @NotBlank(message = "URL cannot be empty")
    @Column(length = 255, nullable = false)
    private String url;

    @NotBlank(message = "Position cannot be left blank")
    @Column(length = 255, nullable = false)
    private String position;
}