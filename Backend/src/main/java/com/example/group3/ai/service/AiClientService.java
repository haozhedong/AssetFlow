package com.example.group3.ai.service;

public interface AiClientService {
    String generateText(String prompt);

    String chatWithHistory(String userMessage, java.util.List<com.example.group3.ai.dto.ChatMessage> history);
}
