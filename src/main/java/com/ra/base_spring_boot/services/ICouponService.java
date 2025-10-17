package com.ra.base_spring_boot.services;

import com.ra.base_spring_boot.dto.req.FormCoupon;
import com.ra.base_spring_boot.dto.resp.CouponResponse;
import com.ra.base_spring_boot.dto.resp.PageResponse;
import com.ra.base_spring_boot.model.Coupon;

import java.util.List;

public interface ICouponService {
    //For Admin
    void deleteCoupon(Long id);
    void createCoupon(FormCoupon formCoupon);
    void updateCoupon(Long id, FormCoupon formCoupon);
    PageResponse<CouponResponse> getAllCoupons(int page, int pageSize, String sortField, String sortOrder,String search);
    //For User
    List<CouponResponse> getAvailableCouponsForUser(Long userId);
    List<CouponResponse> getUserCoupons(Long userId);
    void exchangeCoupon(Long userId, Long couponId);
    boolean canExchangeCoupon(Long userId, Long couponId);
    Coupon applyCouponToBooking(Long userId, String couponCode);
    void removeCouponFromUser(Long userId, Long couponId);
}
