package com.example.group3.ai.service.impl;

import com.example.group3.ai.service.AiClientService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class QwenClientServiceImpl implements AiClientService {

    private final RestTemplate restTemplate;

    @Value("${dashscope.api.key}")
    private String apiKey;

    @Value("${dashscope.base.url}")
    private String baseUrl;

    @Value("${dashscope.model}")
    private String model;

    public QwenClientServiceImpl(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Override
    public String generateText(String prompt) {
        String url = baseUrl + "/chat/completions";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        Map<String, Object> systemMessage = new HashMap<>();
        systemMessage.put("role", "system");
        systemMessage.put("content", "You are a portfolio analysis assistant. Explain portfolio data in concise, user-friendly English.");

        Map<String, Object> userMessage = new HashMap<>();
        userMessage.put("role", "user");
        userMessage.put("content", prompt);

        Map<String, Object> body = new HashMap<>();
        body.put("model", model);
        body.put("messages", List.of(systemMessage, userMessage));

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        ResponseEntity<Map> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                request,
                Map.class
        );

        return extractText(response.getBody());
    }

    private String extractText(Map responseBody) {
        if (responseBody == null) {
            return "No response from model.";
        }

        Object choicesObj = responseBody.get("choices");
        if (!(choicesObj instanceof List<?> choices) || choices.isEmpty()) {
            return "No choices returned.";
        }

        Object firstChoice = choices.get(0);
        if (!(firstChoice instanceof Map<?, ?> choiceMap)) {
            return "Unexpected response format.";
        }

        Object messageObj = choiceMap.get("message");
        if (!(messageObj instanceof Map<?, ?> messageMap)) {
            return "No message returned.";
        }

        Object content = messageMap.get("content");
        return content == null ? "No content returned." : content.toString();
    }
}