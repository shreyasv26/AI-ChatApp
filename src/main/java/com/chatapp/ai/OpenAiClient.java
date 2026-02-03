package com.chatapp.ai;

import org.springframework.ai.chat.model.ChatModel;
import org.springframework.stereotype.Component;

@Component
public class OpenAiClient {
    private final ChatModel chatModel;
    public OpenAiClient(ChatModel chatModel) {
        this.chatModel = chatModel;
    }

    public String callOpenAi(String prompt) {
        return chatModel.call(prompt);
    }
}

