package com.ra.base_spring_boot.exception;

public class HttpConflict extends RuntimeException
{
    public HttpConflict(String message)
    {
        super(message);
    }
}
