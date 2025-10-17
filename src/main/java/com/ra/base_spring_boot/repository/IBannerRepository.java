package com.ra.base_spring_boot.repository;


import com.ra.base_spring_boot.model.Banner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IBannerRepository extends JpaRepository<Banner,Long> {
    Optional<Banner> findById(Long id);
    void deleteById(Long id);
}
