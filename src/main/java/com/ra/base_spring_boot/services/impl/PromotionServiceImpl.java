package com.ra.base_spring_boot.services.impl;

import com.ra.base_spring_boot.dto.req.FormPromotion;
import com.ra.base_spring_boot.dto.resp.FestivalResponse;
import com.ra.base_spring_boot.dto.resp.PageResponse;
import com.ra.base_spring_boot.dto.resp.PromotionResp;
import com.ra.base_spring_boot.model.Promotion;
import com.ra.base_spring_boot.repository.IPromotionsRepository;
import com.ra.base_spring_boot.services.IPromotionService;
import com.ra.base_spring_boot.services.IUploadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PromotionServiceImpl implements IPromotionService {

    @Autowired
    private IPromotionsRepository promotionsRepository;
    @Autowired
    private IUploadService uploadService;

    @Override
    public PageResponse<PromotionResp> getAllPromotions(int page, int pageSize, String sortField, String sortOrder,
            String search) {
        Sort sort = Sort.by(sortOrder.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC, sortField);
        Pageable pageable = PageRequest.of(page, pageSize, sort);
        Page<Promotion> newPage;
        if (StringUtils.hasText(search)) {
            newPage = promotionsRepository.findByTitleContainingIgnoreCase(search, pageable);
        } else {
            newPage = promotionsRepository.findAll(pageable);
        }
        List<PromotionResp> promotionsDTO = newPage.getContent().stream()
                .map(promotion -> PromotionResp.builder()
                .id(promotion.getId())
                .title(promotion.getTitle())
                .content(promotion.getContent())
                .createdAt(promotion.getCreatedAt())
                .updatedAt(promotion.getUpdatedAt())
                .image(promotion.getImage() != null ? promotion.getImage() : null)
                .build())
                .collect(Collectors.toList());
        PageResponse<PromotionResp> response = new PageResponse<>();
        response.setTotal(newPage.getTotalElements());
        response.setPage(newPage.getNumber());
        response.setSize(newPage.getSize());
        response.setData(promotionsDTO);
        return response;
    }

    @Override
    public void createPromotion(FormPromotion formPromotion) {
        Promotion promotion = new Promotion();
        promotion.setTitle(formPromotion.getTitle());
        promotion.setContent(formPromotion.getContent());
        String fileUrl = uploadService.uploadFile(formPromotion.getImage());
        promotion.setImage(fileUrl);
        promotion.setCreatedAt(new Date());
        promotion.setUpdatedAt(null);
        promotionsRepository.save(promotion);
    }

    @Override
    public void updatePromotion(Long id, FormPromotion formPromotion) {
        Promotion promotion = promotionsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Promotion not found"));
        promotion.setTitle(formPromotion.getTitle());
        promotion.setContent(formPromotion.getContent());
        if (formPromotion.getImage() != null && !formPromotion.getImage().isEmpty()) {
            String fileUrl = uploadService.uploadFile(formPromotion.getImage());
            promotion.setImage(fileUrl);
        }
        promotion.setUpdatedAt(new Date());
        promotionsRepository.save(promotion);
    }

    @Override
    public void deletePromotion(Long id) {
        Promotion promotion = promotionsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Promotion not found"));
        promotionsRepository.delete(promotion);
    }

    @Override
    public PromotionResp getPromotionById(Long id) {
        Promotion promotion = promotionsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Promotion not found"));
        PromotionResp promotionResp = PromotionResp.builder()
                .id(promotion.getId())
                .title(promotion.getTitle())
                .content(promotion.getContent())
                .createdAt(promotion.getCreatedAt())
                .updatedAt(promotion.getUpdatedAt())
                .image(promotion.getImage() != null ? promotion.getImage() : null)
                .build();
        return promotionResp;
    }

    @Override
    public Optional<PromotionResp> getPromotionDetail(Long id) {
        return promotionsRepository.findById(id)
                .map(promotion -> PromotionResp.builder()
                .title(promotion.getTitle())
                .image(promotion.getImage())
                .content(promotion.getContent())
                .build());
    }

    @Override
    public List<PromotionResp> getPromotionsForCarousel() {
        Pageable pageable = PageRequest.of(0, 9, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Promotion> promotionPage = promotionsRepository.findAll(pageable);
        return promotionPage.getContent().stream()
                .map(promotion -> PromotionResp.builder()
                .id(promotion.getId())
                .title(promotion.getTitle())
                .content(promotion.getContent())
                .createdAt(promotion.getCreatedAt())
                .updatedAt(promotion.getUpdatedAt())
                .image(promotion.getImage() != null ? promotion.getImage() : null)
                .build())
                .collect(Collectors.toList());
    }
}
