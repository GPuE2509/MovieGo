package com.ra.base_spring_boot.exception;

public class HttpBadRequest extends RuntimeException
{
    public HttpBadRequest(String message)
    {
        super(message);
    }
}
