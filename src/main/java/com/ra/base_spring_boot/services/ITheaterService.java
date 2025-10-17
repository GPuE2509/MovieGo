package com.ra.base_spring_boot.services;

import com.ra.base_spring_boot.dto.req.FormTheater;
import com.ra.base_spring_boot.dto.resp.TheaterResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ITheaterService {
    Page<TheaterResponse> findAll(String keyword, Pageable pageable);
    FormTheater findById(Long id);
    FormTheater create(FormTheater theaterDTO);
    FormTheater update(Long id, FormTheater theaterDTO);
    void delete(Long id);
}
