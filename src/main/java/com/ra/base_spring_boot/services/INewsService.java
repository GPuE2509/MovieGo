package com.ra.base_spring_boot.services;

import com.ra.base_spring_boot.dto.req.FormNew;
import com.ra.base_spring_boot.dto.resp.NewResponse;
import com.ra.base_spring_boot.dto.resp.PageResponse;

import java.util.List;

public interface INewsService {
    PageResponse<NewResponse> getAllNews(int page, int pageSize, String sortField, String sortOrder,String search);
    void createNew(FormNew formNew);
    void updateNew(Long id, FormNew formNew);
    void deleteNew(Long id);
    NewResponse getNewById(Long id);
    List<NewResponse> getNewsForCarousel();
}