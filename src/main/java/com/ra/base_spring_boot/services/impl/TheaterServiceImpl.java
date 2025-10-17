package com.ra.base_spring_boot.services.impl;

import com.ra.base_spring_boot.dto.req.FormTheater;
import com.ra.base_spring_boot.dto.resp.TheaterResponse;
import com.ra.base_spring_boot.exception.HttpBadRequest;
import com.ra.base_spring_boot.model.Screen;
import com.ra.base_spring_boot.model.Theater;
import com.ra.base_spring_boot.repository.IScreenRepository;
import com.ra.base_spring_boot.repository.ITheaterRepository;
import com.ra.base_spring_boot.services.ITheaterService;
import com.ra.base_spring_boot.services.IUploadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TheaterServiceImpl implements ITheaterService {
    @Autowired
    private ITheaterRepository theaterRepository;
    @Autowired
    private IScreenRepository screenRepository;
    @Autowired
    private IUploadService uploadService;

    @Override
    public Page<TheaterResponse> findAll(String keyword, Pageable pageable) {
        return theaterRepository.findByKeyword(keyword, pageable)
                .map(this::mapToResponse);
    }

    @Override
    public FormTheater findById(Long id) {
        Theater theater = theaterRepository.findTheaterByIdAndDeleted(id, false)
                .orElseThrow(() -> new HttpBadRequest("Theater not found with id: " + id + " or deleted"));
        return mapToDTO(theater);
    }

    @Override
    public FormTheater create(FormTheater theaterDTO) {
        if (theaterRepository.existsByNameAndDeleted(theaterDTO.getName(), false)) {
            throw new RuntimeException("Theater name " + theaterDTO.getName() + " already exists");
        }
        Theater theater = mapToEntity(theaterDTO);
        theater.setDeleted(false);
        theater = theaterRepository.save(theater);
        return mapToDTO(theater);
    }

    @Override
    public FormTheater update(Long id, FormTheater theaterDTO) {
        Theater existingTheater = theaterRepository.findTheaterByIdAndDeleted(id, false)
                .orElseThrow(() -> new HttpBadRequest("Theater not found with id: " + id + " or deleted"));
        if (theaterRepository.existsByNameAndDeleted(theaterDTO.getName(), false) && !existingTheater.getName().equals(theaterDTO.getName())) {
            throw new RuntimeException("Theater name " + theaterDTO.getName() + " already exists");
        }
        existingTheater.setName(theaterDTO.getName());
        existingTheater.setLocation(theaterDTO.getLocation());
        existingTheater.setPhone(theaterDTO.getPhone());
        existingTheater.setLatitude(theaterDTO.getLatitude());
        existingTheater.setLongitude(theaterDTO.getLongitude());
        existingTheater.setState(theaterDTO.getState());
        if (theaterDTO.getImage() != null && !theaterDTO.getImage().isEmpty()) {
            String imageUrl = uploadService.uploadFile(theaterDTO.getImage());
            existingTheater.setImage(imageUrl);
        }
        theaterRepository.save(existingTheater);
        return mapToDTO(existingTheater);
    }

    @Override
    public void delete(Long id) {
        Theater theater = theaterRepository.findTheaterByIdAndDeleted(id, false)
                .orElseThrow(() -> new HttpBadRequest("Theater not found with id: " + id + " or already deleted"));
        List<Screen> screens = screenRepository.findByTheaterIdAndDeleted(id, false);
        for (Screen screen : screens) {
            screen.setDeleted(true);
            screenRepository.save(screen);
        }
        theater.setDeleted(true);
        theaterRepository.save(theater);
    }

    private FormTheater mapToDTO(Theater theater) {
        return FormTheater.builder()
                .name(theater.getName())
                .location(theater.getLocation())
                .phone(theater.getPhone())
                .latitude(theater.getLatitude())
                .longitude(theater.getLongitude())
                .state(theater.getState() != null ? theater.getState() : null)
                .imageUrl(theater.getImage()) 
                .build();
    }

    private TheaterResponse mapToResponse(Theater theater) {
        return TheaterResponse.builder()
                .id(theater.getId())
                .name(theater.getName())
                .location(theater.getLocation())
                .phone(theater.getPhone())
                .state(theater.getState() != null ? theater.getState() : null)
                .imageUrl(theater.getImage())
                .build();
    }

    private Theater mapToEntity(FormTheater theaterDTO) {
        String imageUrl = null;
        if (theaterDTO.getImage() != null && !theaterDTO.getImage().isEmpty()) {
            imageUrl = uploadService.uploadFile(theaterDTO.getImage());
        }
        return Theater.builder()
                .name(theaterDTO.getName())
                .location(theaterDTO.getLocation())
                .phone(theaterDTO.getPhone())
                .latitude(theaterDTO.getLatitude())
                .longitude(theaterDTO.getLongitude())
                .state(theaterDTO.getState() != null ? theaterDTO.getState() : null)
                .image(imageUrl)
                .deleted(false)
                .build();
    }
}