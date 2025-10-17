package com.ra.base_spring_boot;
import com.ra.base_spring_boot.dto.req.FormRegister;
import com.ra.base_spring_boot.exception.HttpBadRequest;
import com.ra.base_spring_boot.model.Role;
import com.ra.base_spring_boot.model.User;
import com.ra.base_spring_boot.model.constants.RoleName;
import com.ra.base_spring_boot.model.constants.UserStatus;
import com.ra.base_spring_boot.repository.IUserRepository;
import com.ra.base_spring_boot.services.IRoleService;
import com.ra.base_spring_boot.services.impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.crypto.password.PasswordEncoder;


import java.util.Collections;
import java.util.HashSet;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;
public class RegisterServiceTest {
    @InjectMocks
    private AuthServiceImpl authService;

    @Mock
    private IUserRepository userRepository;

    @Mock
    private IRoleService roleService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testRegisterUserSuccess() {
        FormRegister request = new FormRegister("Admin", "Manager", "admin@gmail.com", "Admin@123", "0123456789", "Admin address");
        when(userRepository.existsByEmail("admin@gmail.com")).thenReturn(false);
        Role role = Role.builder().roleName(RoleName.ROLE_USER).build();
        when(roleService.findByRoleName(RoleName.ROLE_USER)).thenReturn(role);
        when(passwordEncoder.encode("Admin@123")).thenReturn("encodedAdmin@123");
        User savedUser = User.builder()
                .firstName("Admin")
                .lastName("Manager")
                .email("admin@gmail.com")
                .password("encodedAdmin@123")
                .status(UserStatus.ACTIVE)
                .roles(new HashSet<>(Collections.singletonList(role)))
                .build();
        when(userRepository.save(any(User.class))).thenReturn(savedUser);


        authService.register(request);

        verify(userRepository, times(1)).existsByEmail("admin@gmail.com");
        verify(userRepository, times(1)).save(any(User.class));
        verify(roleService, times(1)).findByRoleName(RoleName.ROLE_USER);
        verify(passwordEncoder, times(1)).encode("Admin@123");
    }

    @Test
    public void testRegisterUserWithDuplicateEmail() {

        FormRegister request = new FormRegister("Admin", "Manager", "admin@gmail.com", "Admin@123", "0123456789", "Admin address");
        when(userRepository.existsByEmail("admin@gmail.com")).thenReturn(true);

        HttpBadRequest exception = assertThrows(HttpBadRequest.class, () -> authService.register(request));
        assertEquals("Email is already in use", exception.getMessage());
        verify(userRepository, times(1)).existsByEmail("admin@gmail.com");
        verify(userRepository, times(0)).save(any(User.class));
        verify(roleService, times(0)).findByRoleName(any(RoleName.class));
        verify(passwordEncoder, times(0)).encode(anyString());
    }

}
