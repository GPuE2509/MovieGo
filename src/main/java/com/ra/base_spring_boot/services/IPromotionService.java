package com.ra.base_spring_boot.services;

import com.ra.base_spring_boot.dto.req.FormPromotion;
import com.ra.base_spring_boot.dto.resp.PageResponse;
import com.ra.base_spring_boot.dto.resp.PromotionResp;

import java.util.Optional;
import java.util.List;

public interface IPromotionService {
    PageResponse<PromotionResp> getAllPromotions(int page, int pageSize, String sortField, String sortOrder, String search);
    void createPromotion(FormPromotion formPromotion);
    void updatePromotion(Long id, FormPromotion formPromotion);
    void deletePromotion(Long id);
    PromotionResp getPromotionById(Long id);
    Optional<PromotionResp> getPromotionDetail(Long id);
    List<PromotionResp> getPromotionsForCarousel();
}
