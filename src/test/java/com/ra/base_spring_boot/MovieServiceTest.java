package com.ra.base_spring_boot;
import com.ra.base_spring_boot.dto.resp.MovieResponse;

import com.ra.base_spring_boot.model.Movie;
import com.ra.base_spring_boot.model.Showtime;
import com.ra.base_spring_boot.repository.IMovieRepository;
import com.ra.base_spring_boot.repository.IShowtimeRepository;
import com.ra.base_spring_boot.services.impl.MovieServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
public class MovieServiceTest {
    @InjectMocks
    private MovieServiceImpl movieService;

    @Mock
    private IMovieRepository movieRepository;

    @Mock
    private IShowtimeRepository showtimeRepository;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testGetAllMoviesShowing() {
        // Chuẩn bị dữ liệu
        Calendar cal = Calendar.getInstance();
        cal.setTime(new Date()); // 09:09 AM +07, 03/07/2025
        cal.set(Calendar.HOUR_OF_DAY, 0);
        cal.set(Calendar.MINUTE, 0);
        cal.set(Calendar.SECOND, 0);
        Date startOfDay = cal.getTime(); // 00:00 AM, 03/07/2025
        cal.add(Calendar.DAY_OF_MONTH, 30);
        Date endDate = cal.getTime(); // 00:00 AM, 02/08/2025
        Date now = new Date(); // 09:09 AM, 03/07/2025

        Showtime showtime1 = new Showtime();
        showtime1.setStartTime(new Date(startOfDay.getTime() + 2 * 60 * 60 * 1000)); // 02:00 AM, 03/07/2025
        showtime1.setEndTime(new Date(startOfDay.getTime() + 4 * 60 * 60 * 1000));   // 04:00 AM, 03/07/2025
        Movie movie1 = new Movie();
        movie1.setId(1L);
        movie1.setTitle("Inception");
        movie1.setReleaseDate(new Date(startOfDay.getTime() - 1000000)); // Trước 03/07/2025
        showtime1.setMovie(movie1);

        Showtime showtime2 = new Showtime();
        showtime2.setStartTime(new Date(startOfDay.getTime() + 10 * 60 * 60 * 1000)); // 10:00 AM, 03/07/2025
        showtime2.setEndTime(new Date(startOfDay.getTime() + 12 * 60 * 60 * 1000));   // 12:00 PM, 03/07/2025
        Movie movie2 = new Movie();
        movie2.setId(2L);
        movie2.setTitle("Avatar");
        movie2.setReleaseDate(new Date(startOfDay.getTime() - 2000000)); // Trước 03/07/2025
        showtime2.setMovie(movie2);

        List<Movie> movies = Arrays.asList(movie1, movie2);
        when(showtimeRepository.findMoviesWithShowtimesBetweenDates(startOfDay, endDate)).thenReturn(movies);
        when(movieRepository.findAllById(anySet())).thenReturn(movies); // Không cần thiết nhưng giữ để nhất quán

        // Thực hiện
        List<MovieResponse> result = movieService.getAllMoviesShowing(startOfDay);

        // Xác minh
        assertEquals(2, result.size()); // Cả hai movie thỏa mãn điều kiện
        assertTrue(result.stream().anyMatch(m -> m.getTitle().equals("Inception")));
        assertTrue(result.stream().anyMatch(m -> m.getTitle().equals("Avatar")));
        verify(showtimeRepository, times(1)).findMoviesWithShowtimesBetweenDates(startOfDay, endDate);
        verify(movieRepository, never()).findAllById(anySet()); // Không gọi findAllById vì đã dùng kết quả từ findMoviesWithShowtimesBetweenDates
    }
    @Test
    public void testGetMovieDetail() {
        // Chuẩn bị dữ liệu
        Long movieId = 1L;
        Movie movie = new Movie();
        movie.setId(movieId);
        movie.setTitle("Inception");
        movie.setDescription("A mind-bending thriller");
        when(movieRepository.findById(movieId)).thenReturn(Optional.of(movie));

        // Thực hiện
        Optional<Movie> result = movieService.getMovieDetail(movieId);

        // Xác minh
        assertTrue(result.isPresent());
        assertEquals("Inception", result.get().getTitle());
        verify(movieRepository, times(1)).findById(movieId);
    }

    @Test
    public void testGetMovieTrailer() {
        // Chuẩn bị dữ liệu
        Long movieId = 1L;
        Movie movie = new Movie();
        movie.setId(movieId);
        movie.setTitle("Inception");
        movie.setTrailer("https://example.com/trailer.mp4");
        when(movieRepository.findById(movieId)).thenReturn(Optional.of(movie));

        // Thực hiện
        Optional<String> result = movieService.getMovieTrailer(movieId);

        // Xác minh
        assertTrue(result.isPresent());
        assertEquals("https://example.com/trailer.mp4", result.get());
        verify(movieRepository, times(1)).findById(movieId);
    }

    @Test
    public void testGetMovieDetailNotFound() {
        // Chuẩn bị dữ liệu
        Long movieId = 999L;
        when(movieRepository.findById(movieId)).thenReturn(Optional.empty());

        // Thực hiện
        Optional<Movie> result = movieService.getMovieDetail(movieId);

        // Xác minh
        assertFalse(result.isPresent());
        verify(movieRepository, times(1)).findById(movieId);
    }

    @Test
    public void testGetMovieTrailerNotFound() {
        // Chuẩn bị dữ liệu
        Long movieId = 999L;
        when(movieRepository.findById(movieId)).thenReturn(Optional.empty());

        // Thực hiện
        Optional<String> result = movieService.getMovieTrailer(movieId);

        // Xác minh
        assertFalse(result.isPresent());
        verify(movieRepository, times(1)).findById(movieId);
    }
}
