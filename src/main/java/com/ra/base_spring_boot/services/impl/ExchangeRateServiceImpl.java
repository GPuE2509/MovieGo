package com.ra.base_spring_boot.services.impl;

import com.ra.base_spring_boot.dto.resp.ExchangeRateResponse;
import com.ra.base_spring_boot.services.IExchangeRateService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.client.RestTemplate;

@Service
public class ExchangeRateServiceImpl implements IExchangeRateService {
    private static final Logger logger = LoggerFactory.getLogger(ExchangeRateServiceImpl.class);
    private static final double FALLBACK_RATE = 1.0 / 23000.0;// 0.00004348

    private final String apiUrl;
    private final String apiKey;
    private final RestTemplate restTemplate;

    public ExchangeRateServiceImpl(@Value("${exchange.rate.api.url}") String apiUrl,
                                   @Value("${exchange.rate.api.key}") String apiKey,
                                   RestTemplate restTemplate) {
        this.apiUrl = apiUrl;
        this.apiKey = apiKey;
        this.restTemplate = restTemplate;
    }

    @Override
    @Cacheable(value = "exchangeRates", key = "'VND_TO_USD'")
    public double getVndToUsdRate() {
        String url = apiUrl + apiKey + "/latest/VND";
        try {
            ExchangeRateResponse response = restTemplate.getForObject(url, ExchangeRateResponse.class);
            if (response != null && response.getConversion_rates() != null) {
                Double usdRate = response.getConversion_rates().get("USD");
                if (usdRate != null) {
                    logger.info("Fetched VND to USD rate: {}", usdRate);
                    return usdRate;
                }
            }
            logger.warn("Failed to fetch exchange rate, using fallback rate: {}", FALLBACK_RATE);
            return FALLBACK_RATE;
        } catch (Exception e) {
            logger.error("Error fetching exchange rate: {}", e.getMessage());
            return FALLBACK_RATE;
        }
    }

    @Override
    @CacheEvict(value = "exchangeRates", key = "'VND_TO_USD'")
    public void clearVndToUsdRateCache() {
        logger.info("Cleared VND to USD rate cache");
    }
}