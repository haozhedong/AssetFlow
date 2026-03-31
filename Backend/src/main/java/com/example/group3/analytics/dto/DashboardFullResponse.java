package com.example.group3.analytics.dto;

import java.util.List;

/**
 * phase2 upgrade Dashboard
 */

public class DashboardFullResponse extends DashboardOverviewResponse{
    private String riskLevel;
    private Integer diversificationScore;
    private List<RiskAlertResponse> riskAlerts;

    public String getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(String riskLevel) {
        this.riskLevel = riskLevel;
    }

    public Integer getDiversificationScore() {
        return diversificationScore;
    }

    public void setDiversificationScore(Integer diversificationScore) {
        this.diversificationScore = diversificationScore;
    }

    public List<RiskAlertResponse> getRiskAlerts() {
        return riskAlerts;
    }

    public void setRiskAlerts(List<RiskAlertResponse> riskAlerts) {
        this.riskAlerts = riskAlerts;
    }
}
