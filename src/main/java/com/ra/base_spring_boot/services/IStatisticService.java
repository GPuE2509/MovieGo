package com.ra.base_spring_boot.services;

import com.ra.base_spring_boot.dto.resp.NewsEventStatisticsResponse;
import com.ra.base_spring_boot.dto.resp.SupplierRevenueResponse;
import com.ra.base_spring_boot.dto.resp.TicketStatisticsResponse;

import java.util.Date;
import java.util.Map;

public interface IStatisticService {
    Map<String, Long> getUserStatistics();
    Map<String, Object> getMovieStatistics();
    Map<String, Double> getRevenueStatistics(Date startDate, Date endDate);
    TicketStatisticsResponse getTicketStatistics(Date startDate, Date endDate);
    NewsEventStatisticsResponse getNewsEventStatistics();
    SupplierRevenueResponse getSupplierRevenue(Date startDate, Date endDate);
}
