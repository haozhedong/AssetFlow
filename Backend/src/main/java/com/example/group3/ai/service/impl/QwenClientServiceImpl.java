package com.example.group3.ai.service.impl;

import com.example.group3.ai.dto.ChatMessage;
import com.example.group3.ai.service.AiClientService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QwenClientServiceImpl implements AiClientService {

    private final RestTemplate restTemplate;

    @Value("${dashscope.api.key}")
    private String apiKey;

    @Value("${dashscope.base.url}")
    private String baseUrl;

    @Value("${dashscope.model}")
    private String model;

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

    @Override
    public String chatWithHistory(String userMessage, List<ChatMessage> history) {
        String url = baseUrl + "/chat/completions";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        // 构建系统消息
        Map<String, Object> systemMessage = new HashMap<>();
        systemMessage.put("role", "system");
        systemMessage.put("content", "You are a portfolio analysis assistant for an asset management platform. " +
                "Provide concise, clear answers in English. Keep responses brief and actionable unless the user explicitly asks for detailed analysis. " +
                "Focus on practical insights and data-driven recommendations.");

        // 转换历史消息
        List<Map<String, Object>> messages = history.stream()
                .map(msg -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("role", msg.getRole());
                    m.put("content", msg.getContent());
                    return m;
                })
                .collect(Collectors.toList());

        // 添加系统消息到开头
        messages.add(0, systemMessage);

        // 添加当前用户消息
        Map<String, Object> currentMessage = new HashMap<>();
        currentMessage.put("role", "user");
        currentMessage.put("content", userMessage);
        messages.add(currentMessage);

        Map<String, Object> body = new HashMap<>();
        body.put("model", model);
        body.put("messages", messages);

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
            return "";
        }

        Object choicesObj = responseBody.get("choices");
        if (choicesObj instanceof List) {
            List<?> choices = (List<?>) choicesObj;
            if (!choices.isEmpty() && choices.get(0) instanceof Map) {
                Map<?, ?> firstChoice = (Map<?, ?>) choices.get(0);
                Object messageObj = firstChoice.get("message");
                if (messageObj instanceof Map) {
                    Map<?, ?> message = (Map<?, ?>) messageObj;
                    Object content = message.get("content");
                    if (content instanceof String) {
                        return (String) content;
                    }
                }
            }
        }

        return "";
    }
}