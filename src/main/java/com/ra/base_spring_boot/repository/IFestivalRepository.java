package com.ra.base_spring_boot.repository;

import com.ra.base_spring_boot.model.Festival;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IFestivalRepository extends JpaRepository<Festival, Long> {
    Page<Festival> findByTitleContainingIgnoreCase(String title, Pageable pageable);
}
