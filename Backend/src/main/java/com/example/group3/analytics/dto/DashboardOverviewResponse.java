package com.example.group3.analytics.dto;

import java.util.List;

/**
 * 仪表盘总览聚合
 * @author: Luke
 * GET /api/dashboard/overview
 */

public class DashboardOverviewResponse {
    private PortfolioSummaryResponse summary;
    private List<AllocationItemResponse> allocation;
    private List<TopHoldingItemResponse> topHoldings;
    private List<RiskAlertResponse> riskAlerts;
    private String aiSummaryPlaceholder;

    public PortfolioSummaryResponse getSummary() {
        return summary;
    }

    public void setSummary(PortfolioSummaryResponse summary) {
        this.summary = summary;
    }

    public List<AllocationItemResponse> getAllocation() {
        return allocation;
    }

    public void setAllocation(List<AllocationItemResponse> allocation) {
        this.allocation = allocation;
    }

    public List<TopHoldingItemResponse> getTopHoldings() {
        return topHoldings;
    }

    public void setTopHoldings(List<TopHoldingItemResponse> topHoldings) {
        this.topHoldings = topHoldings;
    }

    public List<RiskAlertResponse> getRiskAlerts() {
        return riskAlerts;
    }

    public void setRiskAlerts(List<RiskAlertResponse> riskAlerts) {
        this.riskAlerts = riskAlerts;
    }

    public String getAiSummaryPlaceholder() {
        return aiSummaryPlaceholder;
    }

    public void setAiSummaryPlaceholder(String aiSummaryPlaceholder) {
        this.aiSummaryPlaceholder = aiSummaryPlaceholder;
    }
}
