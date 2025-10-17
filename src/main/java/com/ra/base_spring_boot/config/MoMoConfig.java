package com.ra.base_spring_boot.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MoMoConfig {

    @Value("${momo.partnerCode}")
    public String partnerCode;

    @Value("${momo.accessKey}")
    public String accessKey;

    @Value("${momo.secretKey}")
    public String secretKey;

    @Value("${momo.payUrl}")
    public String payUrl;

    @Value("${momo.returnUrl}")
    public String returnUrl;

    @Value("${momo.ipnUrl}")
    public String ipnUrl;
}