package com.ra.base_spring_boot.repository;

import com.ra.base_spring_boot.model.Genre;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IGenreRepository extends JpaRepository<Genre,Long> {
    boolean existsByGenreName(String genreName);
}
