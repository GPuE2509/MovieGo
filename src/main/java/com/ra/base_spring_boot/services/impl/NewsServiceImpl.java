package com.ra.base_spring_boot.services.impl;

import com.ra.base_spring_boot.dto.req.FormNew;
import com.ra.base_spring_boot.dto.resp.NewResponse;
import com.ra.base_spring_boot.dto.resp.PageResponse;
import com.ra.base_spring_boot.model.News;
import com.ra.base_spring_boot.repository.INewsRepository;
import com.ra.base_spring_boot.services.INewsService;
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
import java.util.stream.Collectors;

@Service
public class NewsServiceImpl implements INewsService {

    @Autowired
    private INewsRepository newRepository;
    @Autowired
    private IUploadService uploadService;

    @Override
    public PageResponse<NewResponse> getAllNews(int page, int pageSize, String sortField, String sortOrder,
            String search) {
        Sort sort = Sort.by(sortOrder.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC, sortField);
        Pageable pageable = PageRequest.of(page, pageSize, sort);
        Page<News> newPage;
        if (StringUtils.hasText(search)) {
            newPage = newRepository.findByTitleContainingIgnoreCase(search, pageable);
        } else {
            newPage = newRepository.findAll(pageable);
        }
        List<NewResponse> newsDTO = newPage.getContent().stream()
                .map(news -> NewResponse.builder()
                .id(news.getId())
                .title(news.getTitle())
                .content(news.getContent())
                .createdAt(news.getCreatedAt())
                .updatedAt(news.getUpdatedAt())
                .image(news.getImage() != null ? news.getImage() : null)
                .build())
                .collect(Collectors.toList());
        PageResponse<NewResponse> response = new PageResponse<>();
        response.setTotal(newPage.getTotalElements());
        response.setPage(newPage.getNumber());
        response.setSize(newPage.getSize());
        response.setData(newsDTO);
        return response;
    }

    @Override
    public NewResponse getNewById(Long id) {
        News news = newRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("News not found"));
        NewResponse newResponse = NewResponse.builder()
                .id(news.getId())
                .title(news.getTitle())
                .content(news.getContent())
                .createdAt(news.getCreatedAt())
                .updatedAt(news.getUpdatedAt())
                .image(news.getImage() != null ? news.getImage() : null)
                .build();
        return newResponse;
    }

    @Override
    public void createNew(FormNew formNew) {
        News news = new News();
        news.setTitle(formNew.getTitle());
        news.setContent(formNew.getContent());
        String fileUrl = uploadService.uploadFile(formNew.getImage());
        news.setImage(fileUrl);
        news.setCreatedAt(new Date());
        news.setUpdatedAt(null);
        newRepository.save(news);
    }

    @Override
    public void updateNew(Long id, FormNew formNew) {
        News news = newRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("News not found"));
        news.setTitle(formNew.getTitle());
        news.setContent(formNew.getContent());
        if (formNew.getImage() != null && !formNew.getImage().isEmpty()) {
            String fileUrl = uploadService.uploadFile(formNew.getImage());
            news.setImage(fileUrl);
        }
        news.setUpdatedAt(new Date());
        newRepository.save(news);
    }

    @Override
    public void deleteNew(Long id) {
        News news = newRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("News not found"));
        newRepository.delete(news);
    }

    @Override
    public List<NewResponse> getNewsForCarousel() {
        Pageable pageable = PageRequest.of(0, 9, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<News> newsPage = newRepository.findAll(pageable);
        return newsPage.getContent().stream()
                .map(news -> NewResponse.builder()
                .id(news.getId())
                .title(news.getTitle())
                .content(news.getContent())
                .createdAt(news.getCreatedAt())
                .updatedAt(news.getUpdatedAt())
                .image(news.getImage() != null ? news.getImage() : null)
                .build())
                .collect(Collectors.toList());
    }
}
