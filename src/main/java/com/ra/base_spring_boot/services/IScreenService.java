package com.ra.base_spring_boot.services;

import com.ra.base_spring_boot.dto.req.FormScreen;
import com.ra.base_spring_boot.dto.resp.PageResponse;
import com.ra.base_spring_boot.dto.resp.ScreenResp;
import com.ra.base_spring_boot.model.Screen;

import java.util.List;
import java.util.Map;

public interface IScreenService {
    PageResponse<ScreenResp> getAllScreens(int page, int pageSize, String sortField, String sortOrder, String search);
    void createScreen (FormScreen formScreen);
    void updateScreen (Long id,FormScreen formScreen);
    void deleteScreen (Long id);
    List<Screen> getScreenByTheaterId(Long id);
    Map<String, Object> suggestMaxColumns(int seatCapacity, int maxRows);
    Map<String, Object> suggestMaxRows(int seatCapacity, int maxColumns);
}
