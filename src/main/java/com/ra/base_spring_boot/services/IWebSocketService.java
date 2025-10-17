package com.ra.base_spring_boot.services;

import java.util.List;

public interface IWebSocketService {
    void notifySeatStatusChange(Long showtimeId, List<Long> seatIds, boolean isBlocked);
}
