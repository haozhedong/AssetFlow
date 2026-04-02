package com.example.group3.ai.dto;

import lombok.Data;

@Data
public class ChatMessage {
    private String role;  // "user" or "assistant"
    private String content;

    public ChatMessage(String role, String content) {
        this.role = role;
        this.content = content;
    }
}