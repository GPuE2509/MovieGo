package com.ra.base_spring_boot.exception;

public class HttpNotFound extends RuntimeException
{
    public HttpNotFound(String message)
    {
        super(message);
    }
}
