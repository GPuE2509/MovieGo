package com.ra.base_spring_boot.services;


import com.ra.base_spring_boot.dto.req.FormBanner;
import com.ra.base_spring_boot.dto.resp.BannerResponse;
import com.ra.base_spring_boot.model.Banner;

import java.util.List;

public interface IBannerService {
    List<Banner> getAllBanners();
    BannerResponse findBannerById (Long id);
    BannerResponse createBanner (FormBanner formBanner);
    BannerResponse deleteBanner(Long id);
}
