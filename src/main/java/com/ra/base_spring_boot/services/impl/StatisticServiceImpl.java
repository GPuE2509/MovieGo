package com.ra.base_spring_boot.services.impl;

import com.ra.base_spring_boot.controller.StatisticController;
import com.ra.base_spring_boot.dto.resp.NewsEventStatisticsResponse;
import com.ra.base_spring_boot.dto.resp.RevenueDto;
import com.ra.base_spring_boot.dto.resp.SupplierRevenueResponse;
import com.ra.base_spring_boot.dto.resp.TicketCountDto;
import com.ra.base_spring_boot.dto.resp.TicketStatisticsResponse;
import com.ra.base_spring_boot.model.Booking;
import com.ra.base_spring_boot.model.constants.BookingStatus;
import com.ra.base_spring_boot.model.constants.PaymentStatus;
import com.ra.base_spring_boot.model.constants.UserStatus;
import com.ra.base_spring_boot.repository.*;
import com.ra.base_spring_boot.services.IStatisticService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class StatisticServiceImpl implements IStatisticService {
    @Autowired
    private IUserRepository userRepository;

    @Autowired
    private IMovieRepository movieRepository;

    @Autowired
    private IBookingRepository bookingRepository;

    @Autowired
    private INewsRepository newsRepository;

    @Autowired
    private IFestivalRepository festivalRepository;

    private static final Logger log = LoggerFactory.getLogger(StatisticController.class);

    private Date getCurrentDate() {
        return new Date(); // Current date: 02:44 PM +07, 08/07/2025
    }

    // User statistics (active, blocked)
    public Map<String, Long> getUserStatistics() {
        Date currentDate = getCurrentDate();
        Map<String, Long> stats = new HashMap<>();
        stats.put("activeUsers", userRepository.countByStatus(UserStatus.ACTIVE));
        stats.put("blockedUsers", userRepository.countBlockedUsers(currentDate));
        return stats;
    }

    // Movie statistics (currently showing, upcoming, revenue)
    public Map<String, Object> getMovieStatistics() {
        Map<String, Object> stats = new HashMap<>();
        Date currentDate = getCurrentDate();
        stats.put("currentlyShowing", movieRepository.findCurrentlyShowing(currentDate));
        stats.put("comingSoon", movieRepository.findComingSoon(currentDate));
        Double totalRevenueShowing = bookingRepository.findAll().stream()
                .filter(b -> b.getShowtime().getMovie().getReleaseDate().before(currentDate))
                .filter(b -> b.getStatus() == BookingStatus.COMPLETED)
                .filter(b -> b.getPayment() == null || b.getPayment().getPaymentStatus() == PaymentStatus.COMPLETED)
                .mapToDouble(b -> b.getTotalPriceMovie())
                .sum();
        stats.put("totalRevenueCurrentlyShowing", totalRevenueShowing);
        stats.put("totalRevenueComingSoon", 0.0); // No revenue yet
        return stats;
    }

    // Revenue statistics (by day/month/year)
    public Map<String, Double> getRevenueStatistics(Date startDate, Date endDate) {
        Map<String, Double> stats = new HashMap<>();
        Calendar cal = Calendar.getInstance();
        cal.setTime(startDate);

        // Calculate daily revenue
        cal.set(Calendar.HOUR_OF_DAY, 0);
        cal.set(Calendar.MINUTE, 0);
        cal.set(Calendar.SECOND, 0);
        Date dayStart = cal.getTime();
        cal.add(Calendar.DAY_OF_MONTH, 1);
        Date dayEnd = cal.getTime();
        Double dailyRevenue = bookingRepository.sumTotalPriceByDateRange(dayStart, dayEnd);
        stats.put("dailyRevenue", dailyRevenue != null ? dailyRevenue : 0.0);

        // Calculate monthly revenue
        cal.setTime(startDate);
        cal.set(Calendar.DAY_OF_MONTH, 1);
        Date monthStart = cal.getTime();
        cal.add(Calendar.MONTH, 1);
        Date monthEnd = cal.getTime();
        Double monthlyRevenue = bookingRepository.sumTotalPriceByDateRange(monthStart, monthEnd);
        stats.put("monthlyRevenue", monthlyRevenue != null ? monthlyRevenue : 0.0);

        // Calculate annual revenue
        cal.setTime(startDate);
        cal.set(Calendar.DAY_OF_YEAR, 1);
        Date yearStart = cal.getTime();
        cal.add(Calendar.YEAR, 1);
        Date yearEnd = cal.getTime();
        Double yearlyRevenue = bookingRepository.sumTotalPriceByDateRange(yearStart, yearEnd);
        stats.put("yearlyRevenue", yearlyRevenue != null ? yearlyRevenue : 0.0);

        return stats;
    }

    // Ticket statistics
    @Override
    public TicketStatisticsResponse getTicketStatistics(Date startDate, Date endDate) {
        log.info("Fetching ticket statistics for range: {} to {}", startDate, endDate);
        try {
            Long totalTicketsSold = bookingRepository.countTicketsSold(startDate, endDate);
            List<TicketCountDto> ticketsPerTheater = bookingRepository.countTicketsPerTheater(startDate, endDate);
            List<TicketCountDto> ticketsPerMovie = bookingRepository.countTicketsPerMovie(startDate, endDate);
            log.info("Total tickets sold: {}, Tickets per theater: {}, Tickets per movie: {}",
                    totalTicketsSold, ticketsPerTheater, ticketsPerMovie);
            return TicketStatisticsResponse.builder()
                    .totalTicketsSold(totalTicketsSold != null ? totalTicketsSold : 0L)
                    .ticketsPerTheater(ticketsPerTheater != null ? ticketsPerTheater : new ArrayList<>())
                    .ticketsPerMovie(ticketsPerMovie != null ? ticketsPerMovie : new ArrayList<>())
                    .build();
        } catch (Exception e) {
            log.error("Error fetching ticket statistics for range: {} to {}", startDate, endDate, e);
            return TicketStatisticsResponse.builder()
                    .totalTicketsSold(0L)
                    .ticketsPerTheater(new ArrayList<>())
                    .ticketsPerMovie(new ArrayList<>())
                    .build();
        }
    }

    // News and event statistics
    @Override
    public NewsEventStatisticsResponse getNewsEventStatistics() {
        Long totalNews = newsRepository.count();
        Long totalFestivals = festivalRepository.count();
        return NewsEventStatisticsResponse.builder()
                .totalNews(totalNews)
                .totalFestivals(totalFestivals)
                .build();
    }

    // Supplier revenue
    @Override
    public SupplierRevenueResponse getSupplierRevenue(Date startDate, Date endDate) {
        log.info("Fetching supplier revenue for range: {} to {}", startDate, endDate);
        try {
            List<RevenueDto> revenueByDistributor = movieRepository.sumRevenueByPaymentMethod(startDate, endDate);
            return SupplierRevenueResponse.builder()
                    .revenueByDistributor(revenueByDistributor != null ? revenueByDistributor : new ArrayList<>())
                    .build();
        } catch (Exception e) {
            log.error("Error fetching supplier revenue for range: {} to {}", startDate, endDate, e);
            return SupplierRevenueResponse.builder()
                    .revenueByDistributor(new ArrayList<>())
                    .build();
        }
    }
}