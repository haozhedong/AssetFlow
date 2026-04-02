package com.example.group3.ai.controller;

import com.example.group3.ai.dto.ChatMessage;
import com.example.group3.ai.dto.ChatRequest;
import com.example.group3.ai.service.AiClientService;
import com.example.group3.dashboard.Service.DashboardService;
import com.example.group3.analytics.dto.DashboardFullResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ChatController {

    private final AiClientService aiClientService;
    private final DashboardService dashboardService;

    // 存储聊天历史
    private final Map<String, List<ChatMessage>> conversationHistory = new HashMap<>();

    /**
     * 流式聊天端点 - 整句发送，避免字符切割
     */
    @PostMapping(value = "/chat/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE + ";charset=utf-8")
    public SseEmitter streamChat(@RequestBody ChatRequest request) {
        SseEmitter emitter = new SseEmitter(60000L);

        new Thread(() -> {
            try {
                String userMessage = request.getMessage();
                List<ChatMessage> history = conversationHistory.getOrDefault("default", new ArrayList<>());

                // 构建增强提示词
                String enhancedPrompt = buildEnhancedPrompt(userMessage);

                // 调用 AI 获取完整响应
                String aiResponse = aiClientService.chatWithHistory(enhancedPrompt, history);

                // 清理格式
                aiResponse = cleanMarkdownFormatting(aiResponse);

                // 按句子分割（以句号、问号、感叹号为界）
                String[] sentences = splitIntoSentences(aiResponse);

                // 逐句发送，避免字符级切割
                for (String sentence : sentences) {
                    String trimmedSentence = sentence.trim();
                    if (trimmedSentence.isEmpty()) continue;

                    try {
                        // 直接发送整个句子，不再分块
                        emitter.send(SseEmitter.event()
                                .id(String.valueOf(System.nanoTime()))
                                .data(trimmedSentence + " "));

                        // 控制节奏，模拟打字效果
                        Thread.sleep(50);

                    } catch (IOException e) {
                        // 连接断开，退出
                        return;
                    }
                }

                // 保存聊天历史
                history.add(new ChatMessage("user", userMessage));
                history.add(new ChatMessage("assistant", aiResponse));
                conversationHistory.put("default", history);

                // 发送完成标记
                try {
                    emitter.send(SseEmitter.event()
                            .id("done")
                            .data("[DONE]"));
                    emitter.complete();
                } catch (IOException e) {
                    emitter.completeWithError(e);
                }

            } catch (Exception e) {
                try {
                    emitter.send(SseEmitter.event()
                            .id("error")
                            .data("Error: " + e.getMessage()));
                } catch (IOException ex) {
                    // Ignore
                }
                emitter.completeWithError(e);
            }
        }).start();

        return emitter;
    }

    /**
     * 按句号、问号、感叹号分割，不会切断单个字符
     */
    private String[] splitIntoSentences(String text) {
        if (text == null || text.isEmpty()) {
            return new String[0];
        }

        // 使用正则表达式按句号、问号、感叹号分割，但保留标点符号
        String[] sentences = text.split("(?<=[.!?])\\s+");

        // 如果最后一个句子没有标点，也要保留
        return sentences;
    }

    /**
     * 构建增强的提示词
     */
    private String buildEnhancedPrompt(String userMessage) {
        try {
            DashboardFullResponse dashboard = dashboardService.getFullDashboard();

            StringBuilder sb = new StringBuilder();
            sb.append("You are a professional portfolio advisor. Answer concisely without markdown or special formatting.\n");
            sb.append("Base your recommendations on this portfolio data:\n\n");

            if (dashboard.getSummary() != null) {
                sb.append("Portfolio: $").append(dashboard.getSummary().getTotalMarketValue())
                        .append(" | P&L: $").append(dashboard.getSummary().getUnrealizedPnl())
                        .append(" | Return: ").append(dashboard.getSummary().getReturnPct()).append("%\n");
            }

            sb.append("Risk: ").append(dashboard.getRiskLevel())
                    .append(" | Diversification: ").append(dashboard.getDiversificationScore()).append("\n\n");

            if (dashboard.getAllocation() != null && !dashboard.getAllocation().isEmpty()) {
                sb.append("Allocation: ");
                dashboard.getAllocation().forEach(item ->
                        sb.append(item.getAssetType()).append(" ").append(item.getWeightPct()).append("% | ")
                );
                sb.append("\n\n");
            }

            if (dashboard.getTopHoldings() != null && !dashboard.getTopHoldings().isEmpty()) {
                sb.append("Top Holdings: ");
                dashboard.getTopHoldings().stream().limit(3).forEach(item ->
                        sb.append(item.getSymbol()).append(" $").append(item.getMarketValue()).append(" | ")
                );
                sb.append("\n\n");
            }

            if (dashboard.getRiskAlerts() != null && !dashboard.getRiskAlerts().isEmpty()) {
                sb.append("Alerts: ");
                dashboard.getRiskAlerts().forEach(alert ->
                        sb.append(alert.getTitle()).append(" - ").append(alert.getMessage()).append(" | ")
                );
                sb.append("\n\n");
            }

            sb.append("User Question: ").append(userMessage).append("\n\n");
            sb.append("Respond clearly and concisely without using asterisks, hashes, or markdown. Use plain English only.");

            return sb.toString();
        } catch (Exception e) {
            return "Answer concisely in plain English: " + userMessage;
        }
    }

    /**
     * 彻底清理 Markdown 和特殊符号
     */
    private String cleanMarkdownFormatting(String text) {
        if (text == null) return "";

        // 移除所有 ** 符号
        text = text.replaceAll("\\*\\*", "");

        // 移除所有单个 * 符号
        text = text.replaceAll("\\*", "");

        // 移除 # 标记
        text = text.replaceAll("^#+\\s*", "");

        // 移除行首的 - 标记（但保留内容）
        text = java.util.regex.Pattern.compile("^-\\s*", java.util.regex.Pattern.MULTILINE).matcher(text).replaceAll("");

        // 规范化连续的换行
        text = text.replaceAll("\\n{3,}", "\n\n");

        // 移除首尾空格
        text = text.trim();

        return text;
    }

    @DeleteMapping("/chat/history")
    public Map<String, String> clearHistory() {
        conversationHistory.remove("default");
        Map<String, String> response = new HashMap<>();
        response.put("message", "Chat history cleared");
        return response;
    }
}