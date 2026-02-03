package com.chatapp.controller;

import com.chatapp.ChatRateLimiter;
import com.chatapp.model.Message;
import com.chatapp.model.User;
import com.chatapp.repository.MessageRepository;
import com.chatapp.repository.UserRepository;
import com.chatapp.service.MessageService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import java.security.Principal;
import java.time.Instant;


@Controller
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final MessageService messageService;
    private final ChatRateLimiter chatRateLimiter;
    private final UserRepository userRepository;

    public ChatController(SimpMessagingTemplate messagingTemplate, MessageRepository messageRepository, MessageService messageService, ChatRateLimiter chatRateLimiter, UserRepository user, UserRepository userRepository) {
        this.messagingTemplate = messagingTemplate;
        this.messageService = messageService;
        this.chatRateLimiter = chatRateLimiter;
        this.userRepository = userRepository;
    }

    @MessageMapping("/chat.send")
    public void sendMessage(Message message, Principal principal) {
        String emailId = principal.getName();

        if (!chatRateLimiter.isAllowed(emailId)) {
            throw new IllegalStateException("Too many messages. Slow down.");
        }

        if (!message.isAi()) {
            User user = userRepository.findByEmail(emailId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            message.setSender(user.getUsername());
            message.setAi(false);
        }

        message.setTimestamp(Instant.now());
        messageService.save(message); // Persist to MongoDB

        messagingTemplate.convertAndSend(
                "/topic/room/" + message.getRoomId(),
                message
        );
    }

}

