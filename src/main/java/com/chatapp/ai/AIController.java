package com.chatapp.ai;

import com.chatapp.dto.AiRequest;
import com.chatapp.model.Message;
import com.chatapp.repository.MessageRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/ai")
public class AIController {
    private final AIService aiService;
    private final MessageRepository messageRepository;
    private final PromptBuilder promptBuilder;
    private final OpenAiClient openAiClient;

    public AIController(AIService aiService, MessageRepository messageRepository, PromptBuilder promptBuilder, OpenAiClient openAiClient) {
        this.aiService = aiService;
        this.messageRepository = messageRepository;
        this.promptBuilder = promptBuilder;
        this.openAiClient = openAiClient;
    }

    @GetMapping("/summarize/{roomId}")
    public ResponseEntity<String> getSummary(@PathVariable String roomId) {
        List<Message> latestMessages = messageRepository.findTop20ByRoomIdOrderByTimestampDesc(roomId);
        Collections.reverse(latestMessages);
        String summary = aiService.summarize(latestMessages);
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/autoreply/{roomId}")
    public ResponseEntity<Message> autoReply(@PathVariable String roomId, java.security.Principal principal,@RequestParam String username) {
        String myEmail = principal.getName();

        Optional<Message> lastMessageFromOther = messageRepository
                .findFirstByRoomIdAndSenderNotOrderByTimestampDesc(roomId, myEmail);

        if (lastMessageFromOther.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        Message aiReply = aiService.autoReply(
                roomId,
                lastMessageFromOther.get().getContent(),
                username
        );

        return ResponseEntity.ok(aiReply);
    }

    @PostMapping("/process")
    public ResponseEntity<String> processFeature(@RequestBody AiRequest req) {
        String prompt = promptBuilder.build(req);
        String result = openAiClient.callOpenAi(prompt);
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/clear/{roomId}")
    public ResponseEntity<Void> clearChat(@PathVariable String roomId) {
        messageRepository.deleteByRoomId(roomId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/chat")
    public ResponseEntity<String> chatWithAi(@RequestBody AiRequest req) {
        String response = openAiClient.callOpenAi(req.getInput());
        return ResponseEntity.ok(response);
    }

}