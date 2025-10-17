package com.ra.base_spring_boot;

import com.ra.base_spring_boot.dto.req.FormTheater;
import com.ra.base_spring_boot.dto.resp.TheaterResponse;
import com.ra.base_spring_boot.exception.HttpBadRequest;
import com.ra.base_spring_boot.model.Theater;
import com.ra.base_spring_boot.repository.ITheaterRepository;
import com.ra.base_spring_boot.services.impl.TheaterServiceImpl;
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

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TheaterServiceImplTest {

    @Mock
    private ITheaterRepository theaterRepository;

    @InjectMocks
    private TheaterServiceImpl theaterService;

    private Theater testTheater;
    private FormTheater testFormTheater;

    @BeforeEach
    void setUp() {
        testTheater = Theater.builder()
                .name("CGV Vincom")
                .location("District 1, Ho Chi Minh City")
                .phone("0123456789")
                .build();

        testFormTheater = FormTheater.builder()
                .name("CGV Vincom")
                .location("District 1, Ho Chi Minh City")
                .phone("0123456789")
                .build();
    }

    @Test
    void findAll_ShouldReturnPageOfFormTheater() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        Page<Theater> theaterPage = new PageImpl<>(List.of(testTheater));
        when(theaterRepository.findByKeyword("CGV", pageable)).thenReturn(theaterPage);

        // When
        Page<TheaterResponse> result = theaterService.findAll("CGV", pageable);

        // Then
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("CGV Vincom", result.getContent().get(0).getName());
        verify(theaterRepository).findByKeyword("CGV", pageable);
    }

    @Test
    void findById_ShouldReturnFormTheater_WhenTheaterExists() {
        // Given
        when(theaterRepository.findById(1L)).thenReturn(Optional.of(testTheater));

        // When
        FormTheater result = theaterService.findById(1L);

        // Then
        assertNotNull(result);
        assertEquals(testTheater.getName(), result.getName());
        assertEquals(testTheater.getLocation(), result.getLocation());
        assertEquals(testTheater.getPhone(), result.getPhone());
        verify(theaterRepository).findById(1L);
    }

    @Test
    void findById_ShouldThrowException_WhenTheaterNotFound() {
        // Given
        when(theaterRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        HttpBadRequest exception = assertThrows(HttpBadRequest.class,
                () -> theaterService.findById(1L));
        assertEquals("Theater not found with id: 1", exception.getMessage());
    }

    @Test
    void create_ShouldReturnFormTheater_WhenValidInput() {
        // Given
        when(theaterRepository.save(any(Theater.class))).thenReturn(testTheater);

        // When
        FormTheater result = theaterService.create(testFormTheater);

        // Then
        assertNotNull(result);
        assertEquals(testFormTheater.getName(), result.getName());
        assertEquals(testFormTheater.getLocation(), result.getLocation());
        assertEquals(testFormTheater.getPhone(), result.getPhone());
        verify(theaterRepository).save(any(Theater.class));
    }

    @Test
    void update_ShouldReturnUpdatedFormTheater_WhenTheaterExists() {
        // Given
        FormTheater updateForm = FormTheater.builder()
                .name("CGV Landmark")
                .location("District 5, Ho Chi Minh City")
                .phone("0987654321")
                .build();

        when(theaterRepository.findById(1L)).thenReturn(Optional.of(testTheater));
        when(theaterRepository.save(any(Theater.class))).thenReturn(testTheater);

        // When
        FormTheater result = theaterService.update(1L, updateForm);

        // Then
        assertNotNull(result);
        assertEquals("CGV Landmark", testTheater.getName());
        assertEquals("District 5, Ho Chi Minh City", testTheater.getLocation());
        assertEquals("0987654321", testTheater.getPhone());
        verify(theaterRepository).save(testTheater);
    }

    @Test
    void update_ShouldThrowException_WhenTheaterNotFound() {
        // Given
        when(theaterRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        HttpBadRequest exception = assertThrows(HttpBadRequest.class,
                () -> theaterService.update(1L, testFormTheater));
        assertEquals("Theater not found with id: 1", exception.getMessage());
    }

    @Test
    void delete_ShouldDeleteTheater_WhenTheaterExists() {
        // Given
        when(theaterRepository.existsById(1L)).thenReturn(true);
        doNothing().when(theaterRepository).deleteById(1L);

        // When
        theaterService.delete(1L);

        // Then
        verify(theaterRepository).existsById(1L);
        verify(theaterRepository).deleteById(1L);
    }

    @Test
    void delete_ShouldThrowException_WhenTheaterNotFound() {
        // Given
        when(theaterRepository.existsById(1L)).thenReturn(false);

        // When & Then
        HttpBadRequest exception = assertThrows(HttpBadRequest.class,
                () -> theaterService.delete(1L));
        assertEquals("Theater not found with id: 1", exception.getMessage());
        verify(theaterRepository, never()).deleteById(1L);
    }
}
