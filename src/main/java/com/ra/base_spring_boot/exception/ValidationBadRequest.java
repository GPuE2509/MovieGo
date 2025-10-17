package com.ra.base_spring_boot.exception;

public class ValidationBadRequest extends RuntimeException {
    public ValidationBadRequest(String message)
    {
        super(message);
    }
}
