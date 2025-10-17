package com.ra.base_spring_boot;

import com.ra.base_spring_boot.dto.resp.TicketPriceResponse;
import com.ra.base_spring_boot.model.TicketPrice;
import com.ra.base_spring_boot.model.constants.MovieType;
import com.ra.base_spring_boot.model.constants.SeatType;
import com.ra.base_spring_boot.repository.ITicketPriceRepository;
import com.ra.base_spring_boot.services.impl.TicketPriceServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.sql.Time;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TicketPriceServiceImplTest {

    @Mock
    private ITicketPriceRepository ticketPriceRepository;

    @InjectMocks
    private TicketPriceServiceImpl ticketPriceService;

    private TicketPrice testTicketPrice;

    @BeforeEach
    void setUp() {
        testTicketPrice = new TicketPrice();
        testTicketPrice.setId(1L);
        testTicketPrice.setTypeSeat(SeatType.STANDARD);
        testTicketPrice.setTypeMovie(MovieType._3D);
        testTicketPrice.setPrice(100000.0);
        testTicketPrice.setDayType(true);
        testTicketPrice.setStartTime(Time.valueOf(LocalTime.of(9, 0)));
        testTicketPrice.setEndTime(Time.valueOf(LocalTime.of(17, 0)));
    }

    @Test
    void getAllTicketPrices_ShouldReturnPageOfTicketPrices() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        Page<TicketPrice> ticketPricePage = new PageImpl<>(List.of(testTicketPrice));
        when(ticketPriceRepository.findByTypeSeatAndTypeMovie(SeatType.STANDARD, MovieType._3D, pageable))
                .thenReturn(ticketPricePage);

        // When
        Page<TicketPrice> result = ticketPriceService.getAllTicketPrices("STANDARD", "_3D", "id", pageable);

        // Then
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals(SeatType.STANDARD, result.getContent().get(0).getTypeSeat());
        verify(ticketPriceRepository).findByTypeSeatAndTypeMovie(SeatType.STANDARD, MovieType._3D, pageable);
    }

    @Test
    void getAllTicketPrices_ShouldHandleNullParameters() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        Page<TicketPrice> ticketPricePage = new PageImpl<>(List.of(testTicketPrice));
        when(ticketPriceRepository.findByTypeSeatAndTypeMovie(null, null, pageable))
                .thenReturn(ticketPricePage);

        // When
        Page<TicketPrice> result = ticketPriceService.getAllTicketPrices(null, null, null, pageable);

        // Then
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        verify(ticketPriceRepository).findByTypeSeatAndTypeMovie(null, null, pageable);
    }

    @Test
    void getAllTicketPricesForHomePage_ShouldReturnSortedList() {
        // Given
        List<TicketPrice> ticketPrices = List.of(testTicketPrice);
        when(ticketPriceRepository.findAll(Sort.by(Sort.Direction.ASC, "price")))
                .thenReturn(ticketPrices);

        // When
        List<TicketPriceResponse> result = ticketPriceService.getAllTicketPricesForHomePage();

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testTicketPrice.getId(), result.get(0).getId());
        assertEquals(testTicketPrice.getPrice(), result.get(0).getPrice());
        verify(ticketPriceRepository).findAll(Sort.by(Sort.Direction.ASC, "price"));
    }

    @Test
    void getTicketPriceById_ShouldReturnTicketPrice_WhenExists() {
        // Given
        when(ticketPriceRepository.findById(1L)).thenReturn(Optional.of(testTicketPrice));

        // When
        TicketPrice result = ticketPriceService.getTicketPriceById(1L);

        // Then
        assertNotNull(result);
        assertEquals(testTicketPrice.getId(), result.getId());
        assertEquals(testTicketPrice.getPrice(), result.getPrice());
        verify(ticketPriceRepository).findById(1L);
    }

    @Test
    void getTicketPriceById_ShouldThrowException_WhenNotFound() {
        // Given
        when(ticketPriceRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> ticketPriceService.getTicketPriceById(1L));
        assertEquals("Ticket price not found with id: 1", exception.getMessage());
    }

    @Test
    void addTicketPrice_ShouldReturnSavedTicketPrice() {
        // Given
        when(ticketPriceRepository.save(testTicketPrice)).thenReturn(testTicketPrice);

        // When
        TicketPrice result = ticketPriceService.addTicketPrice(testTicketPrice);

        // Then
        assertNotNull(result);
        assertEquals(testTicketPrice.getId(), result.getId());
        verify(ticketPriceRepository).save(testTicketPrice);
    }

    @Test
    void updateTicketPrice_ShouldReturnUpdatedTicketPrice_WhenExists() {
        // Given
        TicketPrice updateData = new TicketPrice();
        updateData.setTypeSeat(SeatType.VIP);
        updateData.setTypeMovie(MovieType._3D);
        updateData.setPrice(200000.0);
        updateData.setDayType(false);
        updateData.setStartTime(Time.valueOf(LocalTime.of(18, 0)));
        updateData.setEndTime(Time.valueOf(LocalTime.of(23, 0)));

        when(ticketPriceRepository.findById(1L)).thenReturn(Optional.of(testTicketPrice));
        when(ticketPriceRepository.save(any(TicketPrice.class))).thenReturn(testTicketPrice);

        // When
        TicketPrice result = ticketPriceService.updateTicketPrice(1L, updateData);

        // Then
        assertNotNull(result);
        assertEquals(SeatType.VIP, testTicketPrice.getTypeSeat());
        assertEquals(MovieType._3D, testTicketPrice.getTypeMovie());
        assertEquals(200000.0, testTicketPrice.getPrice());
        assertFalse(testTicketPrice.isDayType());
        verify(ticketPriceRepository).save(testTicketPrice);
    }

    @Test
    void updateTicketPrice_ShouldThrowException_WhenNotFound() {
        // Given
        when(ticketPriceRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> ticketPriceService.updateTicketPrice(1L, testTicketPrice));
        assertEquals("Ticket price not found", exception.getMessage());
    }

    @Test
    void deleteTicketPrice_ShouldCallRepositoryDelete() {
        // Given
        doNothing().when(ticketPriceRepository).deleteById(1L);

        // When
        ticketPriceService.deleteTicketPrice(1L);

        // Then
        verify(ticketPriceRepository).deleteById(1L);
    }
}