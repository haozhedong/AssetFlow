package com.example.group3.insights.Controller;

import com.example.group3.ai.dto.AiExplainResponse;
import com.example.group3.insights.Service.PortfolioAiInsightService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/insights")
public class PortfolioAiInsightController {

    private final PortfolioAiInsightService portfolioAiInsightService;

    public PortfolioAiInsightController(PortfolioAiInsightService portfolioAiInsightService) {
        this.portfolioAiInsightService = portfolioAiInsightService;
    }

    @GetMapping("/summary/ai")
    public AiExplainResponse getAiSummary() {
        AiExplainResponse response = new AiExplainResponse();
        response.setText(portfolioAiInsightService.generateAiSummary());
        return response;
    }
}