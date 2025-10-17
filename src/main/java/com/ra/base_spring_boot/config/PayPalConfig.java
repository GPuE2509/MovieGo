package com.ra.base_spring_boot.config;

import com.paypal.base.rest.APIContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class PayPalConfig {

    private static final Logger logger = LoggerFactory.getLogger(PayPalConfig.class);

    @Value("${paypal.client-id}")
    private String clientId;

    @Value("${paypal.client-secret}")
    private String clientSecret;

    @Value("${paypal.mode}")
    private String mode;

    @Value("${paypal.returnUrl}")
    private String returnUrl;

    @Value("${paypal.cancelUrl}")
    private String cancelUrl;

    @Bean
    public Map<String, String> paypalSdkConfig() {
        Map<String, String> sdkConfig = new HashMap<>();
        sdkConfig.put("mode", mode);
        sdkConfig.put("clientId", clientId);
        sdkConfig.put("clientSecret", clientSecret);
        sdkConfig.put("returnUrl", returnUrl); // Add return URL
        sdkConfig.put("cancelUrl", cancelUrl); // Add cancel URL
        sdkConfig.put("http.ConnectionTimeout", "30000"); // 30 seconds
        sdkConfig.put("http.ReadTimeout", "30000"); // 30 seconds
        return sdkConfig;
    }

    @Bean
    public APIContext apiContext() {
        try {
            logger.info("Initializing PayPal API context with mode: {}, clientId: {}", mode, clientId);
            APIContext apiContext = new APIContext(clientId, clientSecret, mode);
            apiContext.setConfigurationMap(paypalSdkConfig());
            return apiContext;
        } catch (Exception e) {
            logger.error("Failed to initialize PayPal API context: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to initialize PayPal API context: " + e.getMessage(), e);
        }
    }
}