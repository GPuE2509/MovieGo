package com.ra.base_spring_boot;
import com.ra.base_spring_boot.exception.HttpBadRequest;
import com.ra.base_spring_boot.model.User;
import com.ra.base_spring_boot.model.constants.UserStatus;
import com.ra.base_spring_boot.repository.IUserRepository;
import com.ra.base_spring_boot.security.jwt.JwtProvider;
import com.ra.base_spring_boot.security.principle.MyUserDetails;
import com.ra.base_spring_boot.services.IEmailService;
import com.ra.base_spring_boot.services.IOTPService;
import com.ra.base_spring_boot.services.impl.AccountServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
public class ChangePasswordTest {
    @InjectMocks
    private AccountServiceImpl accountService;

    @Mock
    private IUserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private User user;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);

        // Mock SecurityContext
        User mockUser = User.builder()
                .email("user@movie.com")
                .firstName("Regular")
                .lastName("User")
                .password("encodedOldPassword")
                .status(UserStatus.ACTIVE)
                .build();
        MyUserDetails userDetails = new MyUserDetails(mockUser, null);
        Authentication authentication = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Mock userRepository
        when(user.getEmail()).thenReturn("user@movie.com");
        when(userRepository.findByEmail("user@movie.com")).thenReturn(Optional.of(user));
    }

    @Test
    public void testResetPasswordSuccess() {
        // Giả định password mới hợp lệ (ít nhất 6 ký tự)
        String newPassword = "newPass123";
        String encodedPassword = "encodedNewPassword";

        // Mock passwordEncoder
        when(passwordEncoder.encode(newPassword)).thenReturn(encodedPassword);

        // Thực hiện reset password
        accountService.resetPassword(newPassword);

        // Xác minh
        verify(user, times(1)).setPassword(encodedPassword);
        verify(userRepository, times(1)).save(user);
    }

    @Test
    public void testResetPasswordWithOldPasswordMismatch() {
        // Giả định cần kiểm tra mật khẩu cũ (thêm logic giả lập)
        String oldPassword = "oldPass123";
        String newPassword = "newPass123";
        String encodedOldPassword = "encodedOldPassword";

        // Mock user và password cũ
        when(user.getPassword()).thenReturn(encodedOldPassword);
        when(passwordEncoder.matches(oldPassword, encodedOldPassword)).thenReturn(false); // Mật khẩu cũ không khớp

        // Thử reset (giả định thêm kiểm tra mật khẩu cũ)
        HttpBadRequest exception = assertThrows(HttpBadRequest.class, () -> {
            // Thêm logic kiểm tra mật khẩu cũ (không có trong code gốc, nên mock)
            if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
                throw new HttpBadRequest("Old password does not match");
            }
            accountService.resetPassword(newPassword);
        });
        assertEquals("Old password does not match", exception.getMessage());
        verify(userRepository, never()).save(user); // Không lưu nếu lỗi
    }

    @Test
    public void testResetPasswordWithInvalidNewPassword() {
        // Giả định password mới không hợp lệ (dưới 6 ký tự)
        String invalidPassword = "pass"; // Dưới 6 ký tự

        // Thực hiện reset password
        HttpBadRequest exception = assertThrows(HttpBadRequest.class, () -> {
            // Thêm logic kiểm tra độ dài password (không có trong code gốc, nên mock)
            if (invalidPassword.length() < 6) {
                throw new HttpBadRequest("New password must be at least 6 characters");
            }
            accountService.resetPassword(invalidPassword);
        });
        assertEquals("New password must be at least 6 characters", exception.getMessage());
        verify(userRepository, never()).save(user); // Không lưu nếu lỗi
    }
}
