package com.ra.base_spring_boot.services;

public interface IExchangeRateService {
    double getVndToUsdRate();
    void clearVndToUsdRateCache();
}
