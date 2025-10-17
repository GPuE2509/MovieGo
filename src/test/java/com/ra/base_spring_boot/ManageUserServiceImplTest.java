package com.ra.base_spring_boot;

import com.ra.base_spring_boot.dto.req.FormUpdateProfile;
import com.ra.base_spring_boot.dto.req.FormUsers;
import com.ra.base_spring_boot.dto.resp.PageResponse;
import com.ra.base_spring_boot.dto.resp.UserResponse;
import com.ra.base_spring_boot.exception.HttpBadRequest;
import com.ra.base_spring_boot.model.Role;
import com.ra.base_spring_boot.model.User;
import com.ra.base_spring_boot.model.constants.RoleName;
import com.ra.base_spring_boot.model.constants.UserStatus;
import com.ra.base_spring_boot.repository.IManageUsersRepository;
import com.ra.base_spring_boot.services.impl.ManageUserServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ManageUserServiceImplTest {

    @Mock
    private IManageUsersRepository userRepository;

    @Mock
    private MultipartFile avatarFile;

    @InjectMocks
    private ManageUserServiceImpl manageUserService;

    private User testUser;
    private Role testRole;

    @BeforeEach
    void setUp() {
        testRole = new Role();
        testRole.setRoleName(RoleName.ROLE_USER);

        testUser = new User();
        testUser.setId(1L);
        testUser.setFirstName("John");
        testUser.setLastName("Doe");
        testUser.setEmail("john@example.com");
        testUser.setPhone("0123456789");
        testUser.setAddress("123 Test Street");
        testUser.setStatus(UserStatus.ACTIVE);
        testUser.setCreatedAt(new Date());
        testUser.setUpdatedAt(new Date());
        testUser.setRoles(Set.of(testRole));
    }

    @Test
    void getAllUsers_ShouldReturnPageResponse() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        Page<User> userPage = new PageImpl<>(List.of(testUser));
        when(userRepository.findBySearchAndStatus(anyString(), any(), eq(pageable)))
                .thenReturn(userPage);

        // When
        PageResponse<UserResponse> result = manageUserService.getAllUsers("search", "ACTIVE", "id", pageable);

        // Then
        assertNotNull(result);
        assertEquals(1, result.getTotal());
        assertEquals(1, result.getData().size());
        assertEquals("John", result.getData().get(0).getFirstName());
        verify(userRepository).findBySearchAndStatus(anyString(), any(), eq(pageable));
    }

    @Test
    void getAllUsers_ShouldUnblockExpiredBannedUser() {
        // Given
        testUser.setStatus(UserStatus.BLOCKED);
        testUser.setBanUntil(new Date(System.currentTimeMillis() - 1000)); // Past date

        Pageable pageable = PageRequest.of(0, 10);
        Page<User> userPage = new PageImpl<>(List.of(testUser));
        when(userRepository.findBySearchAndStatus(anyString(), any(), eq(pageable)))
                .thenReturn(userPage);
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // When
        PageResponse<UserResponse> result = manageUserService.getAllUsers("", null, null, pageable);

        // Then
        assertEquals(UserStatus.ACTIVE, testUser.getStatus());
        assertNull(testUser.getBanUntil());
        verify(userRepository).save(testUser);
    }

    @Test
    void getUserById_ShouldReturnUser_WhenUserExists() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

        // When
        User result = manageUserService.getUserById(1L);

        // Then
        assertNotNull(result);
        assertEquals(testUser.getId(), result.getId());
        assertEquals(testUser.getFirstName(), result.getFirstName());
        verify(userRepository).findById(1L);
    }

    @Test
    void getUserById_ShouldThrowException_WhenUserNotFound() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> manageUserService.getUserById(1L));
        assertEquals("User not found with id: 1", exception.getMessage());
    }

    @Test
    void updateUserStatus_ShouldUpdateStatusAndReturnUserResponse() {
        // Given
        FormUsers formUsers = new FormUsers();
        formUsers.setStatus(UserStatus.BLOCKED);
        formUsers.setBanUntil(new Date(System.currentTimeMillis() + 10000));

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // When
        UserResponse result = manageUserService.updateUserStatus(1L, formUsers);

        // Then
        assertNotNull(result);
        assertEquals(UserStatus.BLOCKED, testUser.getStatus());
        assertNotNull(testUser.getBanUntil());
        verify(userRepository).save(testUser);
    }

    @Test
    void updateUserById_ShouldUpdateUser_WhenValidData() {
        // Given
        FormUpdateProfile form = new FormUpdateProfile();
        form.setFirstName("Jane");
        form.setLastName("Smith");
        form.setPhone("0987654321");
        form.setAddress("456 New Street");

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(avatarFile.getOriginalFilename()).thenReturn("avatar.jpg");
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // When
        manageUserService.updateUserById(1L, form);

        // Then
        assertEquals("Jane", testUser.getFirstName());
        assertEquals("Smith", testUser.getLastName());
        assertEquals("jane@example.com", testUser.getEmail());
        verify(userRepository).save(testUser);
    }

    @Test
    void updateUserById_ShouldThrowException_WhenFirstNameIsEmpty() {
        // Given
        FormUpdateProfile form = new FormUpdateProfile();
        form.setFirstName("");
        form.setLastName("Smith");
        form.setAddress("456 New Street");

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

        // When & Then
        HttpBadRequest exception = assertThrows(HttpBadRequest.class,
                () -> manageUserService.updateUserById(1L, form));
        assertEquals("First name is required", exception.getMessage());
    }

    @Test
    void updateUserById_ShouldThrowException_WhenPhoneFormatIsInvalid() {
        // Given
        FormUpdateProfile form = new FormUpdateProfile();
        form.setFirstName("Jane");
        form.setLastName("Smith");
        form.setPhone("invalid-phone");
        form.setAddress("456 New Street");

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

        // When & Then
        HttpBadRequest exception = assertThrows(HttpBadRequest.class,
                () -> manageUserService.updateUserById(1L, form));
        assertEquals("Invalid phone number format", exception.getMessage());
    }
}
