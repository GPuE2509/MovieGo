package com.ra.base_spring_boot.services.impl;

import com.ra.base_spring_boot.exception.HttpBadRequest;
import com.ra.base_spring_boot.model.User;
import com.ra.base_spring_boot.repository.IUserRepository;
import com.ra.base_spring_boot.security.jwt.JwtProvider;
import com.ra.base_spring_boot.services.IAccountService;
import com.ra.base_spring_boot.services.IEmailService;
import com.ra.base_spring_boot.services.IOTPService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AccountServiceImpl implements IAccountService {
    @Autowired
    private final IUserRepository userRepository;
    @Autowired
    private final JwtProvider jwtProvider;
    @Autowired
    private final PasswordEncoder passwordEncoder;
    @Autowired
    private final IEmailService emailService;
    @Autowired
    private final IOTPService otpService;

    @Autowired
    public AccountServiceImpl(IUserRepository userRepository,
                              JwtProvider jwtProvider,
                              PasswordEncoder passwordEncoder,
                              IEmailService emailService,
                              IOTPService otpService) {
        this.userRepository = userRepository;
        this.jwtProvider = jwtProvider;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.otpService = otpService;
    }

    @Override
    public String forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new HttpBadRequest("User not found with email: " + email));

        String otp = otpService.generateOTP(email);
        String tempToken = jwtProvider.generateToken(email);
        String verifyLink = "https://movieticketbooking.com/verify?otp=" + otp + "&email=" + email;

        emailService.sendEmail(email, "Password Reset OTP - Movie Ticket Booking", otp, verifyLink);
        return tempToken;
    }

    @Override
    public void resetPassword(String newPassword) {
        String email = getEmailFromSecurityContext();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new HttpBadRequest("User not found"));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Override
    public void verifyOTP(String otp) {
        String email = getEmailFromSecurityContext();
        if (!otpService.validateOTP(otp)) {
            throw new HttpBadRequest("Invalid or expired OTP");
        }

        String otpEmail = otpService.getEmailByOTP(otp);
        if (!email.equals(otpEmail)) {
            throw new HttpBadRequest("OTP does not match the user");
        }

        otpService.clearOTP(otp);
    }

    private String getEmailFromSecurityContext() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails) {
            return ((UserDetails) principal).getUsername();
        } else {
            throw new HttpBadRequest("Invalid authentication context");
        }
    }
}