package com.ra.base_spring_boot.services;

import com.ra.base_spring_boot.dto.req.FormAvatar;
import com.ra.base_spring_boot.dto.req.FormUpdateProfile;
import com.ra.base_spring_boot.dto.req.FormUsers;
import com.ra.base_spring_boot.dto.resp.PageResponse;
import com.ra.base_spring_boot.dto.resp.UserResponse;
import com.ra.base_spring_boot.model.User;
import org.springframework.data.domain.Pageable;

public interface IManageUserService {
    PageResponse<UserResponse> getAllUsers(String search, String status, String sortBy, Pageable pageable);
    User getUserById(Long id);
    UserResponse updateUserStatus(Long id, FormUsers form);
    void updateUserById(Long id, FormUpdateProfile formUpdateprofile);
    void updateAvatarUser(Long id, FormAvatar avatar);
    void updatePassword(Long id, String newPassword);
}
