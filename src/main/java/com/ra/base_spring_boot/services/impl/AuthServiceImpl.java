package com.ra.base_spring_boot.services.impl;

import com.ra.base_spring_boot.dto.req.FormLogin;
import com.ra.base_spring_boot.dto.req.FormRegister;
import com.ra.base_spring_boot.dto.resp.JwtResponse;
import com.ra.base_spring_boot.exception.HttpBadRequest;
import com.ra.base_spring_boot.model.Role;
import com.ra.base_spring_boot.model.User;
import com.ra.base_spring_boot.model.constants.RoleName;
import com.ra.base_spring_boot.model.constants.UserStatus;
import com.ra.base_spring_boot.repository.IUserRepository;
import com.ra.base_spring_boot.security.jwt.JwtProvider;
import com.ra.base_spring_boot.security.principle.MyUserDetails;
import com.ra.base_spring_boot.services.IAuthService;
import com.ra.base_spring_boot.services.IRoleService;
import com.ra.base_spring_boot.services.ITokenBlacklistService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Calendar;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements IAuthService {
    @Autowired
    private final IRoleService roleService;
    @Autowired
    private final IUserRepository userRepository;
    @Autowired
    private final PasswordEncoder passwordEncoder;
    @Autowired
    private final AuthenticationManager authenticationManager;
    @Autowired
    private final JwtProvider jwtProvider;
    @Autowired
    private final UserDetailsService userDetailsService;
    @Autowired
    private final ITokenBlacklistService tokenBlacklistService;

    @Override
    public void register(FormRegister formRegister) {
        if (userRepository.existsByEmail(formRegister.getEmail())) {
            throw new HttpBadRequest("Email is already in use");
        }

        Set<Role> roles = new HashSet<>();
        roles.add(roleService.findByRoleName(RoleName.ROLE_USER));

        User user = User.builder()
                .firstName(formRegister.getFirstName())
                .lastName(formRegister.getLastName())
                .email(formRegister.getEmail())
                .password(passwordEncoder.encode(formRegister.getPassword()))
                .phone(formRegister.getPhone())
                .address(formRegister.getAddress())
                .status(UserStatus.ACTIVE)
                .point(0)
                .roles(roles)
                .build();
        userRepository.save(user);
    }

    @Override
    public JwtResponse login(FormLogin formLogin) {
        // Find user by email
        User user = userRepository.findByEmail(formLogin.getEmail())
                .orElseThrow(() -> new HttpBadRequest("Username or password is incorrect"));

        // Check if account is locked
        if (user.getStatus() == UserStatus.BLOCKED && user.getBanUntil() != null) {
            Date now = new Date();
            if (user.getBanUntil().after(now)) {
                throw new HttpBadRequest("Your account is locked until " + user.getBanUntil());
            } else {
                // Unlock account if ban has expired
                user.setStatus(UserStatus.ACTIVE);
                user.setBanUntil(null);
                userRepository.save(user);
            }
        }

        // Attempt authentication
        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(formLogin.getEmail(), formLogin.getPassword()));
        } catch (AuthenticationException e) {
            throw new HttpBadRequest("Username or password is incorrect");
        }

        MyUserDetails userDetails = (MyUserDetails) authentication.getPrincipal();

        if (userDetails.getUser().getStatus() != UserStatus.ACTIVE) {
            throw new HttpBadRequest("Your account is blocked");
        }

        return JwtResponse.builder()
                .accessToken(jwtProvider.generateToken(userDetails.getUsername()))
                .user(userDetails.getUser())
                .roles(userDetails.getAuthorities().stream()
                        .map(GrantedAuthority::getAuthority)
                        .collect(Collectors.toSet()))
                .build();
    }

    @Override
    public void banUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new HttpBadRequest("User not found with email: " + email));

        if (user.getStatus() == UserStatus.BLOCKED && user.getBanUntil() != null && user.getBanUntil().after(new Date())) {
            throw new HttpBadRequest("User is already banned until " + user.getBanUntil());
        }

        user.setStatus(UserStatus.BLOCKED);
        Calendar calendar = Calendar.getInstance();
        calendar.add(Calendar.DAY_OF_MONTH, 1);
        user.setBanUntil(calendar.getTime());
        userRepository.save(user);
    }

    @Override
    public void logout(String token) {
        Logger logger = LoggerFactory.getLogger(AuthServiceImpl.class);
        logger.info("Processing logout request");

        if (token == null || !token.startsWith("Bearer ")) {
            logger.error("Invalid token provided for logout: {}", token);
            throw new IllegalArgumentException("Invalid token");
        }

        String jwt = token.substring(7);
        try {
            String username = jwtProvider.extractUsername(jwt);
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            if (!jwtProvider.validateToken(jwt, userDetails)) {
                logger.error("Token is invalid or expired for user: {}", username);
                throw new IllegalArgumentException("Invalid or expired token");
            }

            // Thêm token vào blacklist
            tokenBlacklistService.addToBlacklist(jwt);
            logger.info("Token added to blacklist for user: {}", username);

            // Xóa context bảo mật
            SecurityContextHolder.clearContext();
        } catch (IllegalArgumentException e) {
            logger.error("Logout failed due to invalid token: {}", e.getMessage());
            throw e; // Ném lại ngoại lệ để client xử lý
        } catch (Exception e) {
            logger.error("Failed to process logout: {}", e.getMessage());
            throw new RuntimeException("Internal server error during logout", e); // Ném RuntimeException để xử lý ở GlobalExceptionHandler
        }
    }
}
