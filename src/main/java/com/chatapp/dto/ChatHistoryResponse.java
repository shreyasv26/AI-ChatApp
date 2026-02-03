package com.chatapp.dto;

import java.util.List;

public record ChatHistoryResponse<T>(
        List<T> content,
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean last
) {}
