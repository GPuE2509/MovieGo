package com.ra.base_spring_boot.services;

import com.ra.base_spring_boot.dto.req.FormFestival;
import com.ra.base_spring_boot.dto.req.FormImageFestival;
import com.ra.base_spring_boot.dto.resp.FestivalResponse;
import com.ra.base_spring_boot.dto.resp.PageResponse;
import com.ra.base_spring_boot.model.Festival;

import java.util.Optional;
import java.util.List;

public interface IFestivalService {
    PageResponse<FestivalResponse> getAllFestivals(int page, int pageSize, String sortField, String sortOrder,String search);
    void createFestival(FormFestival formFestival);
    void updateFestival(Long id, FormFestival formFestival);
    void deleteFestival(Long id);
    Optional<FestivalResponse> getFestivalDetail(Long id);
    void updateImageFestival(Long id, FormImageFestival imageFestival);
    Festival getFestivalById(Long id);
    List<FestivalResponse> getTopFestivals();
}