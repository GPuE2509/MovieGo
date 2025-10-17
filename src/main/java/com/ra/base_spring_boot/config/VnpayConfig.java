package com.ra.base_spring_boot.config;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class VnpayConfig {

    @Value("${vnpay.tmnCode}")
    public String vnpTmnCode;

    @Value("${vnpay.hashSecret}")
    public String vnpHashSecret;

    @Value("${vnpay.payUrl}")
    public String vnpPayUrl;

    @Value("${vnpay.returnUrl}")
    public String vnpReturnUrl;

    @Value("${vnpay.ipnUrl}")
    public String vnpIpnUrl;

    /**
     * Retrieves the client's IP address from the HTTP request.
     *
     * @param request The HttpServletRequest object
     * @return The client's IP address or "127.0.0.1" if not available
     */
    public static String getIpAddress(HttpServletRequest request) {
        try {
            String ipAddress = request.getHeader("X-FORWARDED-FOR");
            if (ipAddress == null || ipAddress.isEmpty()) {
                ipAddress = request.getRemoteAddr();
            }
            return ipAddress;
        } catch (Exception e) {
            return "127.0.0.1"; // Fallback IP
        }
    }
}