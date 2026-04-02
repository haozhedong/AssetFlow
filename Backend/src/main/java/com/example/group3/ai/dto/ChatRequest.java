package com.example.group3.ai.dto;

import lombok.Data;

import java.util.HashMap;
import java.util.Map;

@Data
public class ChatRequest {
    private String message;
    private Map<String, Object> portfolioContext = new HashMap<>();
}