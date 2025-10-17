package com.ra.base_spring_boot.dto.resp;
import lombok.*;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class PageResponse<T> {
    private Long total;
    private int page;
    private int size;
    private List<T> data;
    private int totalPages;
    private boolean hasNext;
    private boolean hasPrevious;
}
