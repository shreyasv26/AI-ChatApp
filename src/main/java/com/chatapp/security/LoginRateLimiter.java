package com.chatapp.security;

import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class LoginRateLimiter {

    private static final int MAX_ATTEMPTS = 5;
    private static final long WINDOW_MS = 60_000; // 1 minute

    private final ConcurrentHashMap<String, Attempt> attempts = new ConcurrentHashMap<>();

    public boolean isBlocked(String key) {
        Attempt attempt = attempts.get(key);
        if (attempt == null) return false;

        if (Instant.now().toEpochMilli() - attempt.firstAttemptTime > WINDOW_MS) {
            attempts.remove(key);
            return false;
        }

        return attempt.count >= MAX_ATTEMPTS;
    }

    public void recordAttempt(String key) {
        attempts.compute(key, (k, v) -> {
            if (v == null || Instant.now().toEpochMilli() - v.firstAttemptTime > WINDOW_MS) {
                return new Attempt(1, Instant.now().toEpochMilli());
            }
            v.count++;
            return v;
        });
    }

    private static class Attempt {
        int count;
        long firstAttemptTime;

        Attempt(int count, long time) {
            this.count = count;
            this.firstAttemptTime = time;
        }
    }
}
