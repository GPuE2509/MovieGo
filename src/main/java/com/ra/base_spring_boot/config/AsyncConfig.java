package com.ra.base_spring_boot.config;


import com.ra.base_spring_boot.util.custom.CustomAsyncExceptionHandler;
import org.springframework.aop.interceptor.AsyncUncaughtExceptionHandler;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.AsyncConfigurer;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

@Configuration
public class AsyncConfig implements AsyncConfigurer {
    @Override
    public Executor getAsyncExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(50); // Increase the number of basic threads to 50
        executor.setMaxPoolSize(200); // Increase maximum number of threads to 200
        executor.setQueueCapacity(500); // Increase queue size to 500
        executor.setThreadNamePrefix("Async-"); // Stream name
        executor.setKeepAliveSeconds(60); // Keep thread alive for 60 seconds when not in use
        executor.initialize();
        return executor;
    }

    @Override
    public AsyncUncaughtExceptionHandler getAsyncUncaughtExceptionHandler() {
        return new CustomAsyncExceptionHandler();
    }
}
