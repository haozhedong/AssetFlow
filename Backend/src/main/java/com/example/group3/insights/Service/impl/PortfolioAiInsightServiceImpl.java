package com.example.group3.insights.Service.impl;

import com.example.group3.analytics.dto.DashboardFullResponse;
import com.example.group3.analytics.dto.RiskAlertResponse;
import com.example.group3.dashboard.Service.DashboardService;
import com.example.group3.insights.Service.PortfolioAiInsightService;
import com.example.group3.ai.service.AiClientService;
import org.springframework.stereotype.Service;

@Service
public class PortfolioAiInsightServiceImpl implements PortfolioAiInsightService {

    private final DashboardService dashboardService;
    private final AiClientService aiClientService;

    public PortfolioAiInsightServiceImpl(DashboardService dashboardService,
                                         AiClientService aiClientService) {
        this.dashboardService = dashboardService;
        this.aiClientService = aiClientService;
    }

    @Override
    public String generateAiSummary() {
        DashboardFullResponse dashboard = dashboardService.getFullDashboard();
        String prompt = buildPrompt(dashboard);
        return aiClientService.generateText(prompt);
    }

    private String buildPrompt(DashboardFullResponse dashboard) {
        StringBuilder sb = new StringBuilder();

        sb.append("Please explain this portfolio in simple English. ");
        sb.append("Mention performance, allocation concentration, diversification, risk alerts, and give 2-3 suggestions.\n\n");

        if (dashboard.getSummary() != null) {
            sb.append("Total market value: ").append(dashboard.getSummary().getTotalMarketValue()).append("\n");
            sb.append("Unrealized PnL: ").append(dashboard.getSummary().getUnrealizedPnl()).append("\n");
            sb.append("Return percent: ").append(dashboard.getSummary().getReturnPct()).append("\n");
            sb.append("Holding count: ").append(dashboard.getSummary().getHoldingCount()).append("\n");
        }

        sb.append("Risk level: ").append(dashboard.getRiskLevel()).append("\n");
        sb.append("Diversification score: ").append(dashboard.getDiversificationScore()).append("\n");

        if (dashboard.getAllocation() != null) {
            sb.append("Allocation:\n");
            dashboard.getAllocation().forEach(item ->
                    sb.append("- ").append(item.getAssetType())
                            .append(": ").append(item.getWeightPct()).append("%\n")
            );
        }

        if (dashboard.getTopHoldings() != null) {
            sb.append("Top holdings:\n");
            dashboard.getTopHoldings().forEach(item ->
                    sb.append("- ").append(item.getSymbol())
                            .append(": ").append(item.getMarketValue()).append("\n")
            );
        }

        if (dashboard.getRiskAlerts() != null) {
            sb.append("Risk alerts:\n");
            for (RiskAlertResponse alert : dashboard.getRiskAlerts()) {
                sb.append("- ").append(alert.getTitle())
                        .append(": ").append(alert.getMessage()).append("\n");
            }
        }

        return sb.toString();
    }
}