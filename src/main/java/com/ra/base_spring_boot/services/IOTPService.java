package com.ra.base_spring_boot.services;

public interface IOTPService {
    String generateOTP(String email);
    boolean validateOTP(String otp);
    String getEmailByOTP(String otp);
    void clearOTP(String otp);
}