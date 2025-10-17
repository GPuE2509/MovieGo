package com.ra.base_spring_boot.dto.req;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class FormUpdateProfile {
    private String firstName;
    private String lastName;
    private String phone;
    private String address;
}
