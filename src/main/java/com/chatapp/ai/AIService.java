package com.chatapp.ai;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;
import com.chatapp.model.Message;
import org.springframework.stereotype.Service;

@Service
public class AIService {

    private final OpenAiClient openAiClient;

    public AIService(OpenAiClient openAiClient) {
        this.openAiClient = openAiClient;
    }

    public String summarize(List<Message> messages) {
        String combined = messages.stream()
                .sorted(Comparator.comparing(Message::getTimestamp).reversed())
                .limit(20) // keep prompt size manageable
                .sorted(Comparator.comparing(Message::getTimestamp))
                .map(m -> m.getSender() + ": " + m.getContent())
                .collect(Collectors.joining("\n"));

        try {
            return openAiClient.callOpenAi("Summarize the following conversation concisely:\n" + combined);
        } catch (Exception e) {
            e.printStackTrace();
            return "⚠️ AI failed to generate summary.";
        }
    }

    public Message autoReply(String roomId, String lastMessage, String senderName) {
        try {
            String reply = openAiClient.callOpenAi("generate a response short n simple and professional just like human and no extra lines or explanation so i can paste it directly to: " + lastMessage);

            return new Message(roomId, senderName + " (AI)", reply);
        } catch (Exception e) {
            return new Message(roomId, senderName + " (AI)", "⚠️ AI failed to respond.");
        }
    }
}
