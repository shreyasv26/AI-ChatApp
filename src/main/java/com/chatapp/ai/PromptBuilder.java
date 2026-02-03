package com.chatapp.ai;

import com.chatapp.dto.AiRequest;
import org.springframework.stereotype.Component;


@Component
public class PromptBuilder {

    public String build(AiRequest req) {

        return switch (req.getFeature()) {

            case AUTO_REPLY ->
                    "Reply helpfully to this message:\n" + req.getContext();

            case REPHRASE -> {
                String styles = (req.getStyles() != null && !req.getStyles().isEmpty())
                        ? String.join(", ", req.getStyles())
                        : "professional";

                yield "Rephrase this message to be " + styles +"no extras just the response so i can directly paste it" + req.getInput();
            }

            case SUMMARIZE ->
                    "Summarize the following conversation:\n"
                            + String.join("\n", req.getContext());

            case TRANSLATE ->
                    "Translate this text to " + req.getTargetLanguage() + "do not give any additional information just the response so i can directly paste it"+":\n"
                            + req.getInput();

            case TONE_DETECTION ->
                    "Classify the tone of this message as happy, angry, neutral, or sarcastic. Return only one word label.\n"
                            + req.getInput();

            default -> "Please process this input:\n" + req.getInput();
        };
//        man ig auto reply should fetch last 10 msgs n generate reply
    }
}

