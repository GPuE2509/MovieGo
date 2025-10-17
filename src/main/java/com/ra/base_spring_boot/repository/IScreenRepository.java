package com.ra.base_spring_boot.repository;

import com.ra.base_spring_boot.model.Screen;
import com.ra.base_spring_boot.model.Theater;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IScreenRepository extends JpaRepository<Screen, Long> {
    Page<Screen> findByNameContainingIgnoreCaseAndDeleted(String name, boolean deleted, Pageable pageable);

    Page<Screen> findAllByDeleted(boolean deleted, Pageable pageable);

    List<Screen> findByTheaterIdAndDeleted(Long theaterId, boolean deleted);
}
