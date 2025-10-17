package com.ra.base_spring_boot.security.exception;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(Exception.class)
    public void handle(HttpServletRequest request, HttpServletResponse response, Exception ex) throws IOException {
        log.error("Internal Server Error: {}", ex.getMessage());
        response.setHeader("error", "INTERNAL_SERVER_ERROR");
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        Map<String, Object> errors = new HashMap<>();
        errors.put("code", 500);
        errors.put("error", ex.getMessage() != null ? ex.getMessage() : "Internal Server Error");
        new ObjectMapper().writeValue(response.getOutputStream(), errors);
    }
}