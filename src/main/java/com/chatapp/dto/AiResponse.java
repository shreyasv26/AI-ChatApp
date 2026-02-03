package com.chatapp.dto;

import lombok.Data;

@Data
public class AiResponse {

    private String result;
    private String metadata; // optional (tone, language, etc)

}

