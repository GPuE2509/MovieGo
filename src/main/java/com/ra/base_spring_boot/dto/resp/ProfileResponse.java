package com.ra.base_spring_boot.dto.resp;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class ProfileResponse {
        private String firstName;
        private String lastName;
        private String email;
        private String avatar;
        private String phone;
        private String address;
}
