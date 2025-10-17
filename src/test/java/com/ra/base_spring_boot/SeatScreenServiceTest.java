package com.ra.base_spring_boot;

import com.ra.base_spring_boot.dto.req.FormScreen;
import com.ra.base_spring_boot.dto.req.FormSeat;
import com.ra.base_spring_boot.model.*;
import com.ra.base_spring_boot.model.constants.SeatType;
import com.ra.base_spring_boot.repository.*;
import com.ra.base_spring_boot.services.impl.ScreenServiceImpl;
import com.ra.base_spring_boot.services.impl.SeatServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class SeatScreenServiceTest {

    @InjectMocks
    private ScreenServiceImpl screenService;

    @InjectMocks
    private SeatServiceImpl seatService;

    @Mock
    private IScreenRepository screenRepository;

    @Mock
    private ISeatRepository seatRepository;

    @Mock
    private ITheaterRepository theaterRepository;

    @Mock
    private IBookingSeatRepository bookingSeatRepository;

    @Mock
    private IShowtimeRepository showtimeRepository;

    @Mock
    private ITicketPriceRepository ticketPriceRepository;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testCreateScreenSuccess() {
        FormScreen form = new FormScreen();
        form.setName("Screen A");
        form.setSeat_capacity(20);
        form.setMax_columns(10);
        form.setMax_rows(2);
        form.setTheater_id(1L);

        Theater theater = Theater.builder()
                .name("Theater A")
                .location("Hanoi")
                .latitude(21.0278)
                .longitude(105.8342)
                .state("Active")
                .image("img.jpg")
                .phone("0123456789")
                .build();
        theater.setId(1L);

        when(theaterRepository.findTheaterByIdAndDeleted(1L, false)).thenReturn(Optional.of(theater));
        when(screenRepository.findByTheaterIdAndDeleted(1L, false)).thenReturn(Collections.emptyList());
        when(screenRepository.save(any(Screen.class))).thenAnswer(invocation -> invocation.getArgument(0));

        screenService.createScreen(form);

        verify(screenRepository, times(1)).save(any(Screen.class));
        verify(seatRepository, times(20)).save(any(Seat.class));
    }

    @Test
    public void testCreateScreenDuplicateName() {
        FormScreen form = new FormScreen();
        form.setName("Screen A");
        form.setTheater_id(1L);

        Theater theater = Theater.builder()
                .name("Theater A")
                .location("Hanoi")
                .latitude(21.0278)
                .longitude(105.8342)
                .state("Active")
                .image("img.jpg")
                .phone("0123456789")
                .build();
        theater.setId(1L);
        Screen screen = Screen.builder().name("Screen A").build();

        when(theaterRepository.findTheaterByIdAndDeleted(1L, false)).thenReturn(Optional.of(theater));
        when(screenRepository.findByTheaterIdAndDeleted(1L, false)).thenReturn(List.of(screen));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> screenService.createScreen(form));
        assertEquals("Screen name already exists in this theater", exception.getMessage());
    }

    @Test
    public void testCreateSeatSuccess() {
        FormSeat form = new FormSeat();
        form.setScreenId(1L);
        form.setSeatNumber("A1");
        form.setRow("A");
        form.setColumn(1);
        form.setType(SeatType.STANDARD);
        form.setIsVariable(false);

        Screen screen = Screen.builder()
                .maxColumns(10)
                .maxRows(5)
                .build();

        when(seatRepository.existsByScreenIdAndSeatNumber(1L, "A1")).thenReturn(false);
        when(screenRepository.findById(1L)).thenReturn(Optional.of(screen));
        when(seatRepository.save(any(Seat.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(seatRepository.findByScreen(screen)).thenReturn(List.of(new Seat()));

        seatService.createSeat(form);

        verify(seatRepository, times(1)).save(any(Seat.class));
        verify(screenRepository, times(1)).save(screen);
    }

    @Test
    public void testCreateSeatInvalidRow() {
        FormSeat form = new FormSeat();
        form.setScreenId(1L);
        form.setSeatNumber("Z1");
        form.setRow("Z");
        form.setColumn(1);
        form.setType(SeatType.STANDARD);
        form.setIsVariable(false);

        Screen screen = Screen.builder()
                .maxRows(5)
                .maxColumns(10)
                .build();

        when(seatRepository.existsByScreenIdAndSeatNumber(any(), any())).thenReturn(false);
        when(screenRepository.findById(1L)).thenReturn(Optional.of(screen));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> seatService.createSeat(form));
        assertEquals("Row is out of range for this screen. Max rows: 5", ex.getMessage());
    }
}
