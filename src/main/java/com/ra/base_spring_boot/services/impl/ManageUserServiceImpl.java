package com.ra.base_spring_boot.services.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.ra.base_spring_boot.dto.req.FormAvatar;
import com.ra.base_spring_boot.dto.req.FormUpdateProfile;
import com.ra.base_spring_boot.dto.req.FormUsers;
import com.ra.base_spring_boot.dto.resp.PageResponse;
import com.ra.base_spring_boot.dto.resp.UserResponse;
import com.ra.base_spring_boot.exception.HttpBadRequest;
import com.ra.base_spring_boot.model.User;
import com.ra.base_spring_boot.model.constants.UserStatus;
import com.ra.base_spring_boot.repository.IManageUsersRepository;
import com.ra.base_spring_boot.services.IManageUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.Date;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ManageUserServiceImpl implements IManageUserService {
    @Autowired
    private final IManageUsersRepository userRepository;
    @Autowired
    private final Cloudinary cloudinary;

    @Override
    public PageResponse<UserResponse> getAllUsers(String search, String status, String sortBy, Pageable pageable) {
        UserStatus userStatus = status != null ? UserStatus.valueOf(status) : null;
        Page<User> usersPage = userRepository.findBySearchAndStatus(search, userStatus, pageable);

        Page<UserResponse> responsePage = usersPage.map(user -> {
            // Check if ban has expired
            if (user.getStatus() == UserStatus.BLOCKED && user.getBanUntil() != null &&
                    user.getBanUntil().before(new Date())) {
                user.setStatus(UserStatus.ACTIVE);
                user.setBanUntil(null);
                userRepository.save(user);
            }
            return UserResponse.builder()
                    .id(user.getId())
                    .firstName(user.getFirstName())
                    .lastName(user.getLastName())
                    .email(user.getEmail())
                    .avatar(user.getAvatar())
                    .phone(user.getPhone())
                    .address(user.getAddress())
                    .status(user.getStatus())
                    .banUntil(user.getBanUntil())
                    .createdAt(user.getCreatedAt())
                    .updatedAt(user.getUpdatedAt())
                    .roles(user.getRoles().stream()
                            .map(role -> role.getRoleName().name())
                            .collect(Collectors.toSet()))
                    .build();
        });

        return PageResponse.<UserResponse>builder()
                .total(responsePage.getTotalElements())
                .page(responsePage.getNumber())
                .size(responsePage.getSize())
                .data(responsePage.getContent())
                .totalPages(responsePage.getTotalPages())
                .hasNext(responsePage.hasNext())
                .hasPrevious(responsePage.hasPrevious())
                .build();
    }

    @Override
    public User getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        // Check if ban has expired
        if (user.getStatus() == UserStatus.BLOCKED && user.getBanUntil() != null &&
                user.getBanUntil().before(new Date())) {
            user.setStatus(UserStatus.ACTIVE);
            user.setBanUntil(null);
            userRepository.save(user);
        }
        return user;
    }

    @Override
    public UserResponse updateUserStatus(Long id, FormUsers form) {
        User user = getUserById(id);
        user.setStatus(form.getStatus());
        if (form.getStatus() == UserStatus.BLOCKED && form.getBanUntil() != null) {
            user.setBanUntil(form.getBanUntil());
        } else {
            user.setBanUntil(null);
        }
        userRepository.save(user);

        return UserResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .avatar(user.getAvatar())
                .phone(user.getPhone())
                .address(user.getAddress())
                .status(user.getStatus())
                .banUntil(user.getBanUntil())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .roles(user.getRoles().stream()
                        .map(role -> role.getRoleName().name())
                        .collect(Collectors.toSet()))
                .build();
    }

    @Override
    public void updateUserById(Long id, FormUpdateProfile formUpdateProfile) {
        User user = getUserById(id);
        if (formUpdateProfile.getFirstName() == null || formUpdateProfile.getFirstName().trim().isEmpty()) {
            throw new HttpBadRequest("First name is required");
        }
        if (formUpdateProfile.getLastName() == null || formUpdateProfile.getLastName().trim().isEmpty()) {
            throw new HttpBadRequest("Last name is required");
        }
        if (formUpdateProfile.getPhone() != null && !formUpdateProfile.getPhone().trim().isEmpty() &&
                !formUpdateProfile.getPhone().matches("^(03|05|07|08|09)[0-9]{8}$")) {
            throw new HttpBadRequest("Invalid phone number format");
        }
        if (formUpdateProfile.getAddress() == null || formUpdateProfile.getAddress().trim().isEmpty()) {
            throw new HttpBadRequest("Address is required");
        }
        user.setFirstName(formUpdateProfile.getFirstName());
        user.setLastName(formUpdateProfile.getLastName());
        user.setPhone(formUpdateProfile.getPhone());
        user.setAddress(formUpdateProfile.getAddress());
        userRepository.save(user);
    }

    @Override
    public void updateAvatarUser(Long id, FormAvatar avatar) {
        User user = getUserById(id);
        try {
            String imageUrl = null;
            if (avatar.getAvatar() != null && !avatar.getAvatar().isEmpty()) {
                Map uploadResult = cloudinary.uploader().upload(avatar.getAvatar().getBytes(),
                        ObjectUtils.asMap("resource_type", "image"));
                imageUrl = (String) uploadResult.get("secure_url");
            }
            user.setAvatar(imageUrl);
            userRepository.save(user);
        } catch (IOException e) {
            throw new HttpBadRequest("Error uploading image to Cloudinary");
        }
    }

    @Override
    public void updatePassword(Long id, String newPassword) {
        User user = getUserById(id);
        user.setPassword(newPassword);
        userRepository.save(user);
    }
}