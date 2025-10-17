package com.ra.base_spring_boot;
import com.ra.base_spring_boot.dto.req.FormLogin;
import com.ra.base_spring_boot.dto.resp.JwtResponse;
import com.ra.base_spring_boot.exception.HttpBadRequest;
import com.ra.base_spring_boot.model.Role;
import com.ra.base_spring_boot.model.User;
import com.ra.base_spring_boot.model.constants.RoleName;
import com.ra.base_spring_boot.model.constants.UserStatus;
import com.ra.base_spring_boot.security.jwt.JwtProvider;
import com.ra.base_spring_boot.security.principle.MyUserDetails;
import com.ra.base_spring_boot.services.impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collections;
import java.util.Date;
import java.util.HashSet;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;
public class LoginServiceTest {

    @InjectMocks
    private AuthServiceImpl authService;


    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtProvider jwtProvider;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testLoginSuccess() {

        FormLogin request = new FormLogin("giahuy@gmail.com", "huy123");
        User user = User.builder()
                .email("giahuy@gmail.com")
                .password("huy123")
                .status(UserStatus.ACTIVE)
                .roles(new HashSet<>(Collections.singletonList(Role.builder().roleName(RoleName.ROLE_USER).build())))
                .build();
        Authentication authentication = mock(Authentication.class);
        MyUserDetails userDetails = new MyUserDetails(user, Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")));
        when(authenticationManager.authenticate(new UsernamePasswordAuthenticationToken("giahuy@gmail.com", "huy123")))
                .thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(jwtProvider.generateToken("giahuy@gmail.com")).thenReturn("mocked-jwt-token");

        JwtResponse result = authService.login(request);
        assertEquals(user, result.getUser());
        assertEquals("mocked-jwt-token", result.getAccessToken());
        assertEquals(Collections.singleton("ROLE_USER"), result.getRoles());
        verify(authenticationManager, times(1)).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(jwtProvider, times(1)).generateToken("giahuy@gmail.com");
    }

    @Test
    public void testLoginWithWrongPassword() {

        FormLogin request = new FormLogin("giahuy@gmail.com", "wrongpass");
        when(authenticationManager.authenticate(new UsernamePasswordAuthenticationToken("giahuy@gmail.com", "wrongpass")))
                .thenThrow(new org.springframework.security.authentication.BadCredentialsException("Invalid credentials"));

        HttpBadRequest exception = assertThrows(HttpBadRequest.class, () -> authService.login(request));
        assertEquals("Username or password is incorrect", exception.getMessage());
        verify(authenticationManager, times(1)).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }

    @Test
    public void testLoginWithBlockedAccount() {

        FormLogin request = new FormLogin("giahuy@gmail.com", "huy123");
        User user = User.builder()
                .email("giahuy@gmail.com")
                .password("huy123")
                .status(UserStatus.BLOCKED)
                .banUntil(new Date(System.currentTimeMillis() + 24 * 60 * 60 * 1000)) // Bị khóa đến ngày mai
                .build();
        Authentication authentication = mock(Authentication.class);
        MyUserDetails userDetails = new MyUserDetails(user, Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")));
        when(authenticationManager.authenticate(new UsernamePasswordAuthenticationToken("giahuy@gmail.com", "huy123")))
                .thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(userDetails);

        HttpBadRequest exception = assertThrows(HttpBadRequest.class, () -> authService.login(request));
        assertEquals("your account is blocked", exception.getMessage());
        verify(authenticationManager, times(1)).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }
}