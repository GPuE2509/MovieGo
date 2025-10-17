package com.ra.base_spring_boot.services.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.ra.base_spring_boot.dto.req.FormFestival;
import com.ra.base_spring_boot.dto.req.FormImageFestival;
import com.ra.base_spring_boot.dto.resp.FestivalResponse;
import com.ra.base_spring_boot.dto.resp.PageResponse;
import com.ra.base_spring_boot.exception.HttpBadRequest;
import com.ra.base_spring_boot.model.Festival;
import com.ra.base_spring_boot.repository.IFestivalRepository;
import com.ra.base_spring_boot.services.IFestivalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class FestivalServiceImpl implements IFestivalService {
    @Autowired
    private IFestivalRepository festivalRepository;

    @Autowired
    private Cloudinary cloudinary;

    @Override
    public PageResponse<FestivalResponse> getAllFestivals(int page, int pageSize, String sortField, String sortOrder, String search) {
        Sort sort = Sort.by(sortOrder.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC, sortField);
        Pageable pageable = PageRequest.of(page, pageSize, sort);
        Page<Festival> festivalPage;
        if (StringUtils.hasText(search)) {
            festivalPage = festivalRepository.findByTitleContainingIgnoreCase(search, pageable);
        } else {
            festivalPage = festivalRepository.findAll(pageable);
        }
        List<FestivalResponse> festivalDTO = festivalPage.getContent().stream()
                .map(festival -> FestivalResponse.builder()
                        .id(festival.getId())
                        .title(festival.getTitle())
                        .image(festival.getImage())
                        .startTime(festival.getStartTime())
                        .endTime(festival.getEndTime())
                        .description(festival.getDescription() != null ? festival.getDescription() : "" )
                        .location(festival.getLocation() != null ? festival.getLocation() : "")
                        .build())
                .collect(Collectors.toList());
        PageResponse<FestivalResponse> response = new PageResponse<>();
        response.setTotal(festivalPage.getTotalElements());
        response.setPage(festivalPage.getNumber());
        response.setSize(festivalPage.getSize());
        response.setData(festivalDTO);
        return response;
    }


    @Override
    public void createFestival(FormFestival formFestival) {
        Festival festival = new Festival();
        if (formFestival.getTitle() == null || formFestival.getTitle().trim().isEmpty()) {
            throw new HttpBadRequest("Title is required");
        }
        if (formFestival.getImage() == null || formFestival.getImage().isEmpty()) {
            festival.setImage("default.jpg"); // hoặc "" nếu database chấp nhận empty string
        } else {
            festival.setImage(formFestival.getImage());
        }
        festival.setTitle(formFestival.getTitle());
        festival.setStartTime(formFestival.getStartTime());
        festival.setEndTime(formFestival.getEndTime());
        festival.setDescription(formFestival.getDescription() != null ? formFestival.getDescription() : "" );
        festival.setLocation(formFestival.getLocation() != null ? formFestival.getLocation() : "");
        festivalRepository.save(festival);
    }
    @Override
    public void updateFestival(Long id, FormFestival formFestival) {
        Festival festival = festivalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Festival not found"));
        festival.setTitle(formFestival.getTitle());

        festival.setStartTime(formFestival.getStartTime());
        festival.setEndTime(formFestival.getEndTime());
        festival.setDescription(formFestival.getDescription() != null ? formFestival.getDescription() : "" );
        festival.setLocation(formFestival.getLocation() != null ? formFestival.getLocation() : "");
        festivalRepository.save(festival);
    }
    @Override
    public void updateImageFestival(Long id, FormImageFestival imageFestival) {
       Festival festival = getFestivalById(id);
        try {
            String imageUrl = null;
            if (imageFestival.getImage() != null && !imageFestival.getImage().isEmpty()) {
                Map uploadResult = cloudinary.uploader().upload(imageFestival.getImage().getBytes(),
                        ObjectUtils.asMap("resource_type", "image"));
                imageUrl = (String) uploadResult.get("secure_url");
            }
            festival.setImage(imageUrl);
            festivalRepository.save(festival);
        } catch (IOException e) {
            throw new HttpBadRequest("Error uploading image to Cloudinary");
        }
    }
    @Override
    public Festival getFestivalById(Long id){
        Festival festival = festivalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Festival not found with id: " + id));
        return festival;
    }
    @Override
    public void deleteFestival(Long id) {
        Festival festival = festivalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Festival not found"));
        festivalRepository.delete(festival);
    }

    @Override
    public Optional<FestivalResponse> getFestivalDetail(Long id) {
        return festivalRepository.findById(id)
                .map(festival -> FestivalResponse.builder()
                        .title(festival.getTitle())
                        .image(festival.getImage())
                        .startTime(festival.getStartTime())
                        .endTime(festival.getEndTime())
                        .description(festival.getDescription() != null ? festival.getDescription() : "" )
                        .location(festival.getLocation() != null ? festival.getLocation() : "")
                        .build());
    }

    @Override
    public List<FestivalResponse> getTopFestivals() {
        Pageable pageable = PageRequest.of(0, 3, Sort.by(Sort.Direction.DESC, "startTime"));
        Page<Festival> festivalPage = festivalRepository.findAll(pageable);
        return festivalPage.getContent().stream()
                .map(festival -> FestivalResponse.builder()
                        .id(festival.getId())
                        .title(festival.getTitle())
                        .image(festival.getImage())
                        .startTime(festival.getStartTime())
                        .endTime(festival.getEndTime())
                        .description(festival.getDescription() != null ? festival.getDescription() : "")
                        .location(festival.getLocation() != null ? festival.getLocation() : "")
                        .build())
                .collect(Collectors.toList());
    }
}