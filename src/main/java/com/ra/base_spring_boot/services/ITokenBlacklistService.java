package com.ra.base_spring_boot.services;

public interface ITokenBlacklistService {
    void addToBlacklist(String token);
    boolean isBlacklisted(String token);
}
