package com.ra.base_spring_boot.repository;

import com.ra.base_spring_boot.model.Screen;
import com.ra.base_spring_boot.model.Seat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ISeatRepository extends JpaRepository<Seat, Long> {
    List<Seat> findByScreen(Screen screen);
    List<Seat> findByScreenAndDeletedFalse(Screen screen);
    @Query("SELECT s FROM Seat s WHERE s.id IN :ids AND s.deleted = false")
    List<Seat> findAllByIdInAndDeletedFalse(@Param("ids") List<Long> ids);
    Page<Seat> findByDeletedFalse(Pageable pageable);
    Page<Seat> findBySeatNumberContainingIgnoreCaseAndDeletedFalse(String seatNumber, Pageable pageable);
    Page<Seat> findByDeletedTrue(Pageable pageable);
    Page<Seat> findBySeatNumberContainingIgnoreCaseAndDeletedTrue(String keyword, Pageable pageable);
    boolean existsByScreenIdAndSeatNumber(@NotNull(message = "Screen ID cannot be null") Long screenId, @NotBlank(message = "Seat number cannot be empty") String seatNumber);

    boolean existsByScreenIdAndSeatNumberAndIdNot(@NotNull(message = "Screen ID cannot be null") Long screenId, @NotBlank(message = "Seat number cannot be empty") String seatNumber, Long id);
}
