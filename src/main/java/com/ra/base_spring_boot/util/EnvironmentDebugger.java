package com.ra.base_spring_boot.util;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.util.Arrays;
import java.util.List;

@Component
public class EnvironmentDebugger {

    @Autowired
    private Environment environment;

    private static final List<String> IMPORTANT_VARS = Arrays.asList(
        "MYSQL_DB_HOST", "MYSQL_DB_PORT", "MYSQL_DATABASE", "MYSQL_USER", "MYSQL_PASSWORD",
        "MAIL_USERNAME", "MAIL_PASSWORD", "CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET",
        "JWT_SECRET_KEY", "VNPAY_TMN_CODE", "VNPAY_HASH_SECRET", "PAYPAL_CLIENT_ID", "PAYPAL_CLIENT_SECRET",
        "MOMO_PARTNER_CODE", "MOMO_ACCESS_KEY", "MOMO_SECRET_KEY", "EXCHANGE_RATE_API_KEY",
        "SPRING_PROFILES_ACTIVE", "SERVER_PORT"
    );

    @PostConstruct
    public void debugEnvironment() {
        System.out.println("🔍 === ENVIRONMENT VARIABLES DEBUG ===");
        System.out.println("🌐 Active Profile: " + Arrays.toString(environment.getActiveProfiles()));
        System.out.println("📋 Default Profile: " + Arrays.toString(environment.getDefaultProfiles()));
        
        System.out.println("\n📊 Checking important environment variables:");
        for (String varName : IMPORTANT_VARS) {
            String value = environment.getProperty(varName);
            if (value != null) {
                // Mask sensitive values
                String maskedValue = maskSensitiveValue(varName, value);
                System.out.println("✅ " + varName + " = " + maskedValue);
            } else {
                System.out.println("❌ " + varName + " = NOT SET");
            }
        }
        
        System.out.println("\n🔧 Database Configuration:");
        System.out.println("   Host: " + environment.getProperty("MYSQL_DB_HOST", "NOT SET"));
        System.out.println("   Port: " + environment.getProperty("MYSQL_DB_PORT", "NOT SET"));
        System.out.println("   Database: " + environment.getProperty("MYSQL_DATABASE", "NOT SET"));
        System.out.println("   User: " + environment.getProperty("MYSQL_USER", "NOT SET"));
        
        System.out.println("\n📧 Mail Configuration:");
        System.out.println("   Username: " + environment.getProperty("MAIL_USERNAME", "NOT SET"));
        
        System.out.println("\n☁️ Cloudinary Configuration:");
        System.out.println("   Cloud Name: " + environment.getProperty("CLOUDINARY_CLOUD_NAME", "NOT SET"));
        System.out.println("   API Key: " + maskSensitiveValue("CLOUDINARY_API_KEY", environment.getProperty("CLOUDINARY_API_KEY", "NOT SET")));
        
        System.out.println("🔍 === END ENVIRONMENT DEBUG ===\n");
    }
    
    private String maskSensitiveValue(String varName, String value) {
        if (value == null || value.equals("NOT SET")) {
            return value;
        }
        
        // List of sensitive variables that should be masked
        List<String> sensitiveVars = Arrays.asList(
            "MYSQL_PASSWORD", "MAIL_PASSWORD", "JWT_SECRET_KEY", 
            "VNPAY_HASH_SECRET", "PAYPAL_CLIENT_SECRET", "MOMO_SECRET_KEY",
            "CLOUDINARY_API_SECRET", "EXCHANGE_RATE_API_KEY"
        );
        
        if (sensitiveVars.contains(varName)) {
            if (value.length() <= 4) {
                return "***";
            } else {
                return value.substring(0, 4) + "***" + value.substring(value.length() - 4);
            }
        }
        
        return value;
    }
} 