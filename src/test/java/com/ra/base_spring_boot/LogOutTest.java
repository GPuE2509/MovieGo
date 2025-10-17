package com.ra.base_spring_boot;

import com.ra.base_spring_boot.model.Role;
import com.ra.base_spring_boot.model.User;
import com.ra.base_spring_boot.model.constants.RoleName;
import com.ra.base_spring_boot.model.constants.UserStatus;
import com.ra.base_spring_boot.security.jwt.JwtProvider;
import com.ra.base_spring_boot.security.principle.MyUserDetails;
import com.ra.base_spring_boot.services.IRoleService;
import com.ra.base_spring_boot.services.ITokenBlacklistService;
import com.ra.base_spring_boot.services.impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.core.userdetails.UserDetailsService;



import java.util.HashSet;
import static org.mockito.Mockito.*;
public class LogOutTest {
    @InjectMocks
    private AuthServiceImpl authService;

    @Mock
    private IRoleService roleService;

    @Mock
    private JwtProvider jwtProvider;

    @Mock
    private UserDetailsService userDetailsService;

    @Mock
    private ITokenBlacklistService tokenBlacklistService;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);

        Role role = new Role();
        role.setRoleName(RoleName.ROLE_USER);
        when(roleService.findByRoleName(RoleName.ROLE_USER)).thenReturn(role);
    }

    @Test
    public void testLogoutSuccess() {

        String token = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
        String username = "user@movie.com";
        User user = User.builder()
                .email(username)
                .firstName("Regular")
                .lastName("User")
                .password("encodedPassword")
                .status(UserStatus.ACTIVE)
                .roles(new HashSet<>())
                .build();
        MyUserDetails userDetails = new MyUserDetails(user, null);

        // Mock hành vi
        when(jwtProvider.extractUsername(token.substring(7))).thenReturn(username);
        when(userDetailsService.loadUserByUsername(username)).thenReturn(userDetails);
        when(jwtProvider.validateToken(token.substring(7), userDetails)).thenReturn(true);

        // Thực hiện logout
        authService.logout(token);

        // Xác minh
        verify(tokenBlacklistService, times(1)).addToBlacklist(token.substring(7));
        verify(jwtProvider, times(1)).extractUsername(token.substring(7));
        verify(userDetailsService, times(1)).loadUserByUsername(username);
        verify(jwtProvider, times(1)).validateToken(token.substring(7), userDetails);
    }
}
