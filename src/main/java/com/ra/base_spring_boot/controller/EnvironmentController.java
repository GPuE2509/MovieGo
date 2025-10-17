package com.ra.base_spring_boot.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/env")
public class EnvironmentController {

    @Autowired
    private Environment environment;

    @GetMapping("/check")
    public ResponseEntity<Map<String, Object>> checkEnvironment() {
        Map<String, Object> response = new HashMap<>();
        
        // Check important environment variables
        Map<String, String> envVars = new HashMap<>();
        String[] importantVars = {
            "MYSQL_DB_HOST", "MYSQL_DB_PORT", "MYSQL_DATABASE", "MYSQL_USER", 
            "MAIL_USERNAME", "CLOUDINARY_CLOUD_NAME", "JWT_SECRET_KEY",
            "VNPAY_TMN_CODE", "PAYPAL_CLIENT_ID", "MOMO_PARTNER_CODE",
            "SPRING_PROFILES_ACTIVE", "SERVER_PORT"
        };
        
        for (String var : importantVars) {
            String value = environment.getProperty(var);
            if (value != null) {
                // Mask sensitive values
                String maskedValue = maskSensitiveValue(var, value);
                envVars.put(var, maskedValue);
            } else {
                envVars.put(var, "NOT SET");
            }
        }
        
        response.put("status", "success");
        response.put("message", "Environment variables checked");
        response.put("activeProfiles", environment.getActiveProfiles());
        response.put("defaultProfiles", environment.getDefaultProfiles());
        response.put("environmentVariables", envVars);
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        
        // Check if critical environment variables are set
        boolean dbConfigured = environment.getProperty("MYSQL_DB_HOST") != null;
        boolean mailConfigured = environment.getProperty("MAIL_USERNAME") != null;
        boolean jwtConfigured = environment.getProperty("JWT_SECRET_KEY") != null;
        
        response.put("status", "healthy");
        response.put("database", dbConfigured ? "configured" : "not configured");
        response.put("mail", mailConfigured ? "configured" : "not configured");
        response.put("jwt", jwtConfigured ? "configured" : "not configured");
        response.put("timestamp", System.currentTimeMillis());
        
        return ResponseEntity.ok(response);
    }
    
    private String maskSensitiveValue(String varName, String value) {
        if (value == null) {
            return null;
        }
        
        // List of sensitive variables that should be masked
        String[] sensitiveVars = {
            "MYSQL_PASSWORD", "MAIL_PASSWORD", "JWT_SECRET_KEY", 
            "VNPAY_HASH_SECRET", "PAYPAL_CLIENT_SECRET", "MOMO_SECRET_KEY",
            "CLOUDINARY_API_SECRET", "EXCHANGE_RATE_API_KEY"
        };
        
        for (String sensitiveVar : sensitiveVars) {
            if (varName.equals(sensitiveVar)) {
                if (value.length() <= 4) {
                    return "***";
                } else {
                    return value.substring(0, 4) + "***" + value.substring(value.length() - 4);
                }
            }
        }
        
        return value;
    }
} 