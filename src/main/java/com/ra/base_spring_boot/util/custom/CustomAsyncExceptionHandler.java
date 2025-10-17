package com.ra.base_spring_boot.util.custom;

import com.ra.base_spring_boot.exception.PaymentException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.aop.interceptor.AsyncUncaughtExceptionHandler;

import java.lang.reflect.Method;

public class CustomAsyncExceptionHandler implements AsyncUncaughtExceptionHandler {
    private static final Logger logger = LoggerFactory.getLogger(CustomAsyncExceptionHandler.class);

    @Override
    public void handleUncaughtException(Throwable throwable, Method method, Object... params) {
        if (throwable instanceof PaymentException) {
            logger.error("PaymentException in async method: {} - {}", method.getName(), throwable.getMessage(), throwable);
            // Additional handling, e.g., notify admin, store in database for monitoring
        } else {
            logger.error("Uncaught exception in async method: {} - {}", method.getName(), throwable.getMessage(), throwable);
        }
    }
}
