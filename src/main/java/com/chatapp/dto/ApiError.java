package com.chatapp.dto;

import java.time.Instant;

public record ApiError(
        String message,
        int status,
        Instant timestamp
) {
    public ApiError(String message, int status) {
        this(message, status, Instant.now());
    }
}
