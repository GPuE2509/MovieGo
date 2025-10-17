package com.ra.base_spring_boot.repository;

import com.ra.base_spring_boot.model.Coupon;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ICouponRepository extends JpaRepository<Coupon, Long> {

    Page<Coupon> findByNameContainingIgnoreCase(String search, Pageable pageable);
}
