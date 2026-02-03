package com.chatapp;

import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class ChatRateLimiter {

    private static final int MAX_MESSAGES = 5;
    private static final long WINDOW_MS = 10_000; // 10 seconds

    private final Map<String, UserRate> users = new ConcurrentHashMap<>();

    public boolean isAllowed(String userId) {
        long now = System.currentTimeMillis();

        users.putIfAbsent(userId, new UserRate(0, now));
        UserRate rate = users.get(userId);

        // reset window
        if (now - rate.windowStart > WINDOW_MS) {
            rate.count = 0;
            rate.windowStart = now;
        }

        rate.count++;
        return rate.count <= MAX_MESSAGES;
    }

    private static class UserRate {
        int count;
        long windowStart;

        UserRate(int count, long windowStart) {
            this.count = count;
            this.windowStart = windowStart;
        }
    }
}

