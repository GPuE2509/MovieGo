package com.ra.base_spring_boot.exception;

public class HttpForbiden extends RuntimeException
{
    public HttpForbiden(String message)
    {
        super(message);
    }
}
