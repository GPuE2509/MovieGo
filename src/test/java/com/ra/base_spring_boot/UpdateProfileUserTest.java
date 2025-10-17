package com.ra.base_spring_boot;

import com.ra.base_spring_boot.dto.req.FormUpdateProfile;
import com.ra.base_spring_boot.exception.HttpBadRequest;
import com.ra.base_spring_boot.model.User;
import com.ra.base_spring_boot.model.Role;
import com.ra.base_spring_boot.model.constants.RoleName;
import com.ra.base_spring_boot.model.constants.UserStatus;
import com.ra.base_spring_boot.repository.IManageUsersRepository;
import com.ra.base_spring_boot.security.principle.MyUserDetails;
import com.ra.base_spring_boot.services.impl.ManageUserServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Collections;
import java.util.HashSet;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

public class UpdateProfileUserTest {

    @InjectMocks
    private ManageUserServiceImpl manageUserService;

    @Mock
    private IManageUsersRepository userRepository;

    @Mock
    private Authentication authentication;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
        SecurityContextHolder.setContext(org.springframework.security.core.context.SecurityContextHolder.createEmptyContext());
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    @Test
    public void testUpdateUserByIdSuccess() {

        Long userId = 1L;
        FormUpdateProfile updateProfile = new FormUpdateProfile();
        updateProfile.setFirstName("Gia");
        updateProfile.setLastName("Huy Updated");
        updateProfile.setPhone("0901234567");
        updateProfile.setAddress("New Address");

        MockMultipartFile avatarFile = new MockMultipartFile("avatar", "test.jpg", "image/jpeg", "test content".getBytes());

        User user = User.builder()
                .firstName("Gia")
                .lastName("Huy")
                .email("giahuy@gmail.com")
                .phone("0987654321")
                .address("Old Address")
                .status(UserStatus.ACTIVE)
                .roles(new HashSet<>(Collections.singletonList(Role.builder().roleName(RoleName.ROLE_USER).build())))
                .build();
        user.setId(userId);
        MyUserDetails userDetails = new MyUserDetails(user, Collections.singletonList(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_USER")));
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenReturn(user);


        manageUserService.updateUserById(userId, updateProfile);

        verify(userRepository, times(1)).findById(userId);
        verify(userRepository, times(1)).save(any(User.class));
    }


    @Test
    public void testUpdateUserByIdWithInvalidData() {
        Long userId = 1L;
        FormUpdateProfile updateProfile = new FormUpdateProfile();
        updateProfile.setFirstName(""); // Rỗng
        updateProfile.setLastName("User");
        updateProfile.setPhone("123"); // Không hợp lệ
        updateProfile.setAddress("New Address");

        MockMultipartFile avatarFile = new MockMultipartFile("avatar", "test.jpg", "image/jpeg", "test content".getBytes());

        User user = User.builder()
                .firstName("Gia")
                .lastName("Huy")
                .email("giahuy@gmail.com")
                .status(UserStatus.ACTIVE)
                .roles(new HashSet<>(Collections.singletonList(Role.builder().roleName(RoleName.ROLE_USER).build())))
                .build();
        user.setId(userId);
        MyUserDetails userDetails = new MyUserDetails(user, Collections.singletonList(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_USER")));
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        HttpBadRequest exception = assertThrows(HttpBadRequest.class, () -> manageUserService.updateUserById(userId, updateProfile));
        assertEquals("First name is required", exception.getMessage());
        verify(userRepository, times(1)).findById(userId);
        verify(userRepository, times(0)).save(any(User.class));
    }
}