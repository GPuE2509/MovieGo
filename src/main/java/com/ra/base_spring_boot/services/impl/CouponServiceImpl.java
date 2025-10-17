package com.ra.base_spring_boot.services.impl;

import com.ra.base_spring_boot.dto.req.FormCoupon;

import com.ra.base_spring_boot.dto.resp.CouponResponse;

import com.ra.base_spring_boot.dto.resp.PageResponse;
import com.ra.base_spring_boot.model.Coupon;
import com.ra.base_spring_boot.model.User;
import com.ra.base_spring_boot.repository.ICouponRepository;
import com.ra.base_spring_boot.repository.IUserRepository;
import com.ra.base_spring_boot.services.ICouponService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CouponServiceImpl implements ICouponService {

    @Autowired
    private ICouponRepository couponRepository;

    @Autowired
    private IUserRepository userRepository;

    @Override
    public List<CouponResponse> getAvailableCouponsForUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Coupon> allCoupons = couponRepository.findAll();

        return allCoupons.stream()
                .filter(coupon -> !user.getCoupons().contains(coupon)) // User doesn't have this coupon
                .map(this::mapToCouponResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<CouponResponse> getUserCoupons(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return user.getCoupons().stream()
                .map(this::mapToCouponResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void exchangeCoupon(Long userId, Long couponId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Coupon coupon = couponRepository.findById(couponId)
                .orElseThrow(() -> new RuntimeException("Coupon not found"));

        // Check if user has enough points
        if (user.getPoint() < coupon.getExchange_point()) {
            throw new RuntimeException("Insufficient points to exchange this coupon");
        }

        // Check if user already has this coupon
        if (user.getCoupons().contains(coupon)) {
            throw new RuntimeException("You already have this coupon");
        }

        // Deduct points and add coupon to user
        user.setPoint(user.getPoint() - coupon.getExchange_point().intValue());
        user.getCoupons().add(coupon);

        userRepository.save(user);
    }

    @Override
    public boolean canExchangeCoupon(Long userId, Long couponId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Coupon coupon = couponRepository.findById(couponId)
                .orElseThrow(() -> new RuntimeException("Coupon not found"));

        return user.getPoint() >= coupon.getExchange_point() &&
                !user.getCoupons().contains(coupon);
    }

    @Override
    public Coupon applyCouponToBooking(Long userId, String couponCode) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Coupon coupon = user.getCoupons().stream()
                .filter(c -> c.getCode().equals(couponCode))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Coupon not found or not owned by user"));

        return coupon;
    }

    @Override
    @Transactional
    public void removeCouponFromUser(Long userId, Long couponId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Coupon coupon = couponRepository.findById(couponId)
                .orElseThrow(() -> new RuntimeException("Coupon not found"));

        user.getCoupons().remove(coupon);
        userRepository.save(user);
    }

    // Helper method to map Coupon to CouponResponse
    private CouponResponse mapToCouponResponse(Coupon coupon) {
        return CouponResponse.builder()
                .id(coupon.getId())
                .name(coupon.getName())
                .code(coupon.getCode())
                .value(coupon.getValue())
                .exchange_point(coupon.getExchange_point())
                .build();
    }

    @Override
    public PageResponse<CouponResponse> getAllCoupons(int page, int pageSize, String sortField, String sortOrder, String search) {
        Sort sort = Sort.by(sortOrder.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC, sortField);
        Pageable pageable = PageRequest.of(page, pageSize, sort);
        Page<Coupon> couponPage;
        if (StringUtils.hasText(search)) {
            couponPage = couponRepository.findByNameContainingIgnoreCase(search, pageable);
        } else {
            couponPage = couponRepository.findAll(pageable);
        }
        List<CouponResponse> couponsDTO = couponPage.getContent().stream()
                .map(coupons -> CouponResponse.builder()
                        .id(coupons.getId())
                        .name(coupons.getName())
                        .code(coupons.getCode())
                        .value(coupons.getValue())
                        .exchange_point(coupons.getExchange_point())
                        .build())
                .collect(Collectors.toList());
        PageResponse<CouponResponse> response = new PageResponse<>();
        response.setTotal(couponPage.getTotalElements());
        response.setPage(couponPage.getNumber());
        response.setSize(couponPage.getSize());
        response.setData(couponsDTO);
        return response;
    }


    @Override
    public void createCoupon(FormCoupon formCoupon) {
        Coupon coupons = new Coupon();
        coupons.setName(formCoupon.getName());
        if (coupons.getName().contains("%") && formCoupon.getValue() > 100) {
            throw new RuntimeException("Percentage discount cannot exceed 100%");
        }
        coupons.setCode(formCoupon.getCode());
        coupons.setValue(formCoupon.getValue());
        coupons.setExchange_point(formCoupon.getExchange_point());
        coupons.setCreatedAt(new Date());
        coupons.setUpdatedAt(null);
        couponRepository.save(coupons);
    }

    @Override
    public void updateCoupon(Long id, FormCoupon formCoupon) {
        Coupon coupons = couponRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Coupon not found"));
        coupons.setName(formCoupon.getName());
        if (coupons.getName().contains("%") && formCoupon.getValue() > 100) {
            throw new RuntimeException("Percentage discount cannot exceed 100%");
        }
        coupons.setCode(formCoupon.getCode());
        coupons.setValue(formCoupon.getValue());
        coupons.setExchange_point(formCoupon.getExchange_point());
        coupons.setUpdatedAt(new Date());
        couponRepository.save(coupons);
    }

    @Override
    public void deleteCoupon(Long id) {
        Coupon coupons = couponRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Coupon not found"));
        couponRepository.delete(coupons);
    }

}
