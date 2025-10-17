package com.ra.base_spring_boot.services;

import com.ra.base_spring_boot.model.Genre;

import java.util.List;
import java.util.Set;

public interface IGenreService {
    List<Genre> getAllGenres();
    Genre addGenre(Genre genre);
    Genre updateGenre(Long id, Genre genre);
    void deleteGenre(Long id);
    Set<Genre> findAllByIds(Set<Long> ids);
}
