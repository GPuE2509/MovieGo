package com.ra.base_spring_boot.services.impl;

import com.ra.base_spring_boot.services.IOTPService;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OTPServiceImpl implements IOTPService {
    private final Map<String, OTPData> otpCache = new ConcurrentHashMap<>();
    private final long OTP_VALID_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

    @Data
    @AllArgsConstructor
    private static class OTPData {
        private String otp;
        private long expiryTime;
        private String email;
    }

    @Override
    public String generateOTP(String email) {
        String otp = String.format("%06d", new Random().nextInt(999999));
        long expiryTime = System.currentTimeMillis() + OTP_VALID_DURATION;

        otpCache.put(otp, new OTPData(otp, expiryTime, email));
        return otp;
    }

    public boolean validateOTP(String otp) {
        OTPData otpData = otpCache.get(otp);
        if (otpData == null) {
            return false;
        }

        return otpData.getOtp().equals(otp) &&
                System.currentTimeMillis() <= otpData.getExpiryTime();
    }

    public String getEmailByOTP(String otp) {
        OTPData otpData = otpCache.get(otp);
        return otpData != null ? otpData.getEmail() : null;
    }

    public void clearOTP(String otp) {
        otpCache.remove(otp);
    }
}