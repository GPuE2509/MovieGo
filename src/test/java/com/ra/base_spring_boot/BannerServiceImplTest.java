package com.ra.base_spring_boot;

import com.ra.base_spring_boot.dto.req.FormBanner;
import com.ra.base_spring_boot.dto.resp.BannerResponse;
import com.ra.base_spring_boot.model.Banner;
import com.ra.base_spring_boot.repository.IBannerRepository;
import com.ra.base_spring_boot.services.impl.BannerServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static com.ra.base_spring_boot.model.constants.BannerType.IMAGE;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BannerServiceImplTest {

    @Mock
    private IBannerRepository bannerRepository;

    @InjectMocks
    private BannerServiceImpl bannerService;

    private Banner testBanner;
    private FormBanner testFormBanner;

    @BeforeEach
    void setUp() {
        testBanner = new Banner();
        testBanner.setId(1L);
        testBanner.setType(IMAGE);
        testBanner.setUrl("https://example.com/banner.jpg");
        testBanner.setPosition("TOP");

        testFormBanner = new FormBanner();
        testFormBanner.setType(IMAGE);
        testFormBanner.setPosition("TOP");
    }

    @Test
    void findBannerById_ShouldReturnBannerResponse_WhenBannerExists() {
        // Given
        when(bannerRepository.findById(1L)).thenReturn(Optional.of(testBanner));

        // When
        BannerResponse result = bannerService.findBannerById(1L);

        // Then
        assertNotNull(result);
        assertEquals(testBanner.getId(), result.getId());
        assertEquals(testBanner.getType(), result.getType());
        assertEquals(testBanner.getUrl(), result.getUrl());
        assertEquals(testBanner.getPosition(), result.getPosition());
        verify(bannerRepository).findById(1L);
    }

    @Test
    void findBannerById_ShouldThrowException_WhenBannerNotFound() {
        // Given
        when(bannerRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> bannerService.findBannerById(1L));
        assertEquals("Banner not found", exception.getMessage());
    }

    @Test
    void createBanner_ShouldReturnBannerResponse_WhenValidInput() {
        // Given
        when(bannerRepository.save(any(Banner.class))).thenReturn(testBanner);

        // When
        BannerResponse result = bannerService.createBanner(testFormBanner);

        // Then
        assertNotNull(result);
        assertEquals(testBanner.getId(), result.getId());
        assertEquals(testBanner.getType(), result.getType());
        assertEquals(testBanner.getUrl(), result.getUrl());
        assertEquals(testBanner.getPosition(), result.getPosition());
        assertEquals("Banner created", result.getMessage());
        verify(bannerRepository).save(any(Banner.class));
    }

    @Test
    void deleteBanner_ShouldReturnSuccessMessage_WhenBannerExists() {
        // Given
        when(bannerRepository.findById(1L)).thenReturn(Optional.of(testBanner));
        doNothing().when(bannerRepository).deleteById(1L);

        // When
        BannerResponse result = bannerService.deleteBanner(1L);

        // Then
        assertNotNull(result);
        assertEquals("Banner deleted", result.getMessage());
        verify(bannerRepository).findById(1L);
        verify(bannerRepository).deleteById(1L);
    }

    @Test
    void deleteBanner_ShouldThrowException_WhenBannerNotFound() {
        // Given
        when(bannerRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> bannerService.deleteBanner(1L));
        assertEquals("Banner not found", exception.getMessage());
        verify(bannerRepository, never()).deleteById(1L);
    }
}
