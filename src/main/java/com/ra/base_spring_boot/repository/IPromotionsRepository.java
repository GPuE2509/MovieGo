package com.ra.base_spring_boot.repository;

import com.ra.base_spring_boot.model.Promotion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IPromotionsRepository extends JpaRepository<Promotion, Long>  {
    Page<Promotion> findByTitleContainingIgnoreCase(String title, Pageable pageable);
}
