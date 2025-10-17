package com.ra.base_spring_boot.services.impl;

import com.ra.base_spring_boot.model.Genre;
import com.ra.base_spring_boot.repository.IGenreRepository;
import com.ra.base_spring_boot.services.IGenreService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GenreServiceImpl implements IGenreService {
    @Autowired
    private final IGenreRepository genreRepository;

    @Override
    public List<Genre> getAllGenres() {
        return genreRepository.findAll();
    }

    @Override
    public Genre addGenre(Genre genre) {
        if (genreRepository.existsByGenreName(genre.getGenreName())) {
            throw new RuntimeException("Genre with name " + genre.getGenreName() + " already exists");
        }
        return genreRepository.save(genre);
    }

    @Override
    public Genre updateGenre(Long id, Genre genre) {
        Genre existingGenre = genreRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Genre not found"));
        if (!existingGenre.getGenreName().equals(genre.getGenreName()) &&
                genreRepository.existsByGenreName(genre.getGenreName())) {
            throw new RuntimeException("Genre with name " + genre.getGenreName() + " already exists");
        }
        existingGenre.setGenreName(genre.getGenreName());
        return genreRepository.save(existingGenre);
    }

    @Override
    public void deleteGenre(Long id) {
        genreRepository.deleteById(id);
    }

    @Override
    public Set<Genre> findAllByIds(Set<Long> ids) {
        return genreRepository.findAllById(ids).stream().collect(Collectors.toSet());
    }
}