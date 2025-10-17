package com.ra.base_spring_boot.services;

public interface IAccountService {
    String forgotPassword(String email);
    void resetPassword(String newPassword);
    void verifyOTP(String otp);
}