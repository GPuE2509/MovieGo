package com.ra.base_spring_boot.services.impl;

import com.ra.base_spring_boot.dto.resp.SeatBookingMessage;
import com.ra.base_spring_boot.model.constants.BookingStatus;
import com.ra.base_spring_boot.services.IWebSocketService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WebSocketServiceImpl implements IWebSocketService {
    
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    public void notifySeatStatusChange(Long showtimeId, List<Long> seatIds, boolean isBlocked) {
        SeatBookingMessage message = SeatBookingMessage.builder()
                .showtimeId(showtimeId)
                .seatIds(seatIds)
                .status(isBlocked ? BookingStatus.PENDING : BookingStatus.COMPLETED)
                .isBlocked(isBlocked)
                .build();
        
        messagingTemplate.convertAndSend("/topic/showtime/" + showtimeId + "/seats", message);
    }
}
