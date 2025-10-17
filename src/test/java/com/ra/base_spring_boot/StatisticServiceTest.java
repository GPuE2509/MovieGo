package com.ra.base_spring_boot;

import com.ra.base_spring_boot.dto.resp.NewsEventStatisticsResponse;
import com.ra.base_spring_boot.dto.resp.SupplierRevenueResponse;
import com.ra.base_spring_boot.dto.resp.TicketCountDto;
import com.ra.base_spring_boot.dto.resp.TicketStatisticsResponse;
import com.ra.base_spring_boot.model.Booking;
import com.ra.base_spring_boot.model.Movie;

import com.ra.base_spring_boot.model.Showtime;
import com.ra.base_spring_boot.model.constants.UserStatus;
import com.ra.base_spring_boot.repository.*;
import com.ra.base_spring_boot.services.impl.StatisticServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

public class StatisticServiceTest {
    @InjectMocks
    private StatisticServiceImpl statisticService;

    @Mock
    private IUserRepository userRepository;

    @Mock
    private IMovieRepository movieRepository;

    @Mock
    private IBookingRepository bookingRepository;

    @Mock
    private INewsRepository newsRepository;

    @Mock
    private IFestivalRepository festivalRepository;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testGetUserStatistics() {
        when(userRepository.countByStatus(UserStatus.ACTIVE)).thenReturn(500L);
        when(userRepository.countBlockedUsers(any(Date.class))).thenReturn(20L);

        Map<String, Long> stats = statisticService.getUserStatistics();

        assertEquals(500L, stats.get("activeUsers"));
        assertEquals(20L, stats.get("blockedUsers"));
        verify(userRepository, times(1)).countByStatus(UserStatus.ACTIVE);
        verify(userRepository, times(1)).countBlockedUsers(any(Date.class));
    }

    @Test
    public void testGetMovieStatistics() {
        Date currentDate = new Date();
        List<Booking> bookings = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            Movie movie = new Movie();
            movie.setId((long) i + 1);
            movie.setReleaseDate(new Date(currentDate.getTime() - 1000000)); // Đã phát hành
            Showtime showtime = new Showtime();
            showtime.setMovie(movie);
            Booking booking = new Booking();
            booking.setTotalPriceMovie(50000.0 + i * 10000.0);
            booking.setShowtime(showtime);
            bookings.add(booking);
        }
        for (int i = 10; i < 15; i++) {
            Movie movie = new Movie();
            movie.setId((long) i + 1);
            movie.setReleaseDate(new Date(currentDate.getTime() + 1000000)); // Sắp chiếu
            Showtime showtime = new Showtime();
            showtime.setMovie(movie);
            Booking booking = new Booking();
            booking.setTotalPriceMovie(0.0); // Chưa có doanh thu
            booking.setShowtime(showtime);
            bookings.add(booking);
        }
        when(bookingRepository.findAll()).thenReturn(bookings); // Sử dụng findAll thay vì findByReleaseDateBefore

        Map<String, Object> stats = statisticService.getMovieStatistics();

        assertEquals(10L, stats.get("currentlyShowing")); // Số phim khác nhau
        assertEquals(5L, stats.get("comingSoon"));       // Số phim khác nhau
        assertEquals(450000.0, stats.get("totalRevenueCurrentlyShowing")); // Tổng 50000 + 60000 + ... + 140000
        assertEquals(0.0, stats.get("totalRevenueComingSoon"));
        verify(bookingRepository, times(1)).findAll();
    }

    @Test
    public void testGetRevenueStatistics() {
        Date startDate = new Date();
        Date endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000); // +1 ngày
        when(bookingRepository.sumTotalPriceByDateRange(any(Date.class), any(Date.class)))
                .thenReturn(50000000.0);

        Map<String, Double> stats = statisticService.getRevenueStatistics(startDate, endDate);

        assertEquals(50000000.0, stats.get("dailyRevenue"));
        assertTrue(stats.get("monthlyRevenue") >= 50000000.0);
        assertTrue(stats.get("yearlyRevenue") >= 50000000.0);
        verify(bookingRepository, times(3)).sumTotalPriceByDateRange(any(Date.class), any(Date.class));
    }

    @Test
    public void testGetTicketStatistics() {
        Date startDate = new Date();
        Date endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
        when(bookingRepository.countTicketsSold(startDate, endDate)).thenReturn(2000L);
        Map<Integer, Long> ticketsPerTheater = new HashMap<>();
        ticketsPerTheater.put(1, 800L);
        ticketsPerTheater.put(2, 600L);
        ticketsPerTheater.put(3, 600L);
        Map<Integer, Long> ticketsPerMovie = new HashMap<>();
        ticketsPerMovie.put(1, 900L);
        ticketsPerMovie.put(2, 700L);
        ticketsPerMovie.put(3, 400L);
        when(bookingRepository.countTicketsPerTheater(startDate, endDate)).thenReturn((List<TicketCountDto>) ticketsPerTheater);
        when(bookingRepository.countTicketsPerMovie(startDate, endDate)).thenReturn((List<TicketCountDto>) ticketsPerMovie);

        TicketStatisticsResponse response = statisticService.getTicketStatistics(startDate, endDate);

        assertEquals(2000L, response.getTotalTicketsSold());
        assertEquals(ticketsPerTheater, response.getTicketsPerTheater());
        assertEquals(ticketsPerMovie, response.getTicketsPerMovie());
        verify(bookingRepository, times(1)).countTicketsSold(startDate, endDate);
        verify(bookingRepository, times(1)).countTicketsPerTheater(startDate, endDate);
        verify(bookingRepository, times(1)).countTicketsPerMovie(startDate, endDate);
    }

    @Test
    public void testGetNewsEventStatistics() {
        when(newsRepository.count()).thenReturn(50L);
        when(festivalRepository.count()).thenReturn(10L);

        NewsEventStatisticsResponse response = statisticService.getNewsEventStatistics();

        assertEquals(50L, response.getTotalNews());
        assertEquals(10L, response.getTotalFestivals());
        verify(newsRepository, times(1)).count();
        verify(festivalRepository, times(1)).count();
    }

    @Test
    public void testGetSupplierRevenue() {
        Date startDate = new Date();
        Date endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
        Map<String, Double> revenueMap = new HashMap<>();
        revenueMap.put("Distributor A", 600000000.0);
        revenueMap.put("Distributor B", 400000000.0);


        SupplierRevenueResponse response = statisticService.getSupplierRevenue(startDate, endDate);

        assertEquals(revenueMap, response.getRevenueByDistributor());
        verify(movieRepository, times(1)).sumRevenueByPaymentMethod(startDate, endDate);
    }

}