package com.chatapp.service;

import com.chatapp.model.Message;
import com.chatapp.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final MessageRepository messageRepository;

    public Page<Message> getChatHistory(String roomId, int page, int size) {
        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by("timestamp").descending() // Change "createdAt" to "timestamp"
        );
        return messageRepository.findByRoomId(roomId, pageable);
    }
}

