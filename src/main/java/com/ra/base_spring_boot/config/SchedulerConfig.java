package com.ra.base_spring_boot.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;

@Configuration
public class SchedulerConfig {

    @Bean
    public TaskScheduler taskScheduler() {
        ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
        scheduler.setPoolSize(75); // Increase to 75 threads to support 10,000 concurrent users
        scheduler.setThreadNamePrefix("PaymentTimeoutScheduler-");
        scheduler.initialize();
        return scheduler;
    }
}