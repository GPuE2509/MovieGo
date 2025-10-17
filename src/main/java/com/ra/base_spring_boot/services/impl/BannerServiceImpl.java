package com.ra.base_spring_boot.services.impl;

import com.ra.base_spring_boot.dto.req.FormBanner;
import com.ra.base_spring_boot.dto.resp.BannerResponse;
import com.ra.base_spring_boot.model.Banner;
import com.ra.base_spring_boot.repository.IBannerRepository;
import com.ra.base_spring_boot.services.IBannerService;
import com.ra.base_spring_boot.services.IUploadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BannerServiceImpl implements IBannerService {
    @Autowired
    private IBannerRepository iBannerRepository;

    @Autowired
    private IUploadService uploadService;

    @Override
    public List<Banner> getAllBanners() {
        return iBannerRepository.findAll();
    }

    @Override
    public BannerResponse findBannerById(Long id) {
        Banner banner = iBannerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Banner not found"));
        BannerResponse dto = new BannerResponse();
        dto.setId(banner.getId());
        dto.setType(banner.getType());
        dto.setUrl(banner.getUrl());
        dto.setPosition(banner.getPosition());
        return dto;
    }

    @Override
    public BannerResponse createBanner(FormBanner formBanner) {
        Banner banner = new Banner();
        banner.setType(formBanner.getType());
        banner.setPosition(formBanner.getPosition());

        String fileUrl = uploadService.uploadFile(formBanner.getFile());
        banner.setUrl(fileUrl);

        banner = iBannerRepository.save(banner);

        BannerResponse dto = new BannerResponse();
        dto.setId(banner.getId());
        dto.setType(banner.getType());
        dto.setUrl(banner.getUrl());
        dto.setPosition(banner.getPosition());
        dto.setMessage("Banner created");
        return dto;
    }

    @Override
    public BannerResponse deleteBanner(Long id) {
        iBannerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Banner not found"));
        iBannerRepository.deleteById(id);
        BannerResponse dto = new BannerResponse();
        dto.setMessage("Banner deleted");
        return dto;
    }

}