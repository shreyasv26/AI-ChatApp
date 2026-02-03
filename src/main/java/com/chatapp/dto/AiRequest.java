package com.chatapp.dto;

import com.chatapp.ai.AiFeature;
import lombok.Data;

import java.util.List;

@Data
public class AiRequest {

    private AiFeature feature;
    private String input;
    private List<String> context; // optional (for summary / chat)
    private String targetLanguage; // for translation
    private List<String> styles;


}

