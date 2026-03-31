package com.example.group3.dashboard.Service.impl;

import com.example.group3.analytics.dto.DashboardOverviewResponse;
import com.example.group3.analytics.dto.RiskAlertResponse;
import com.example.group3.analytics.Service.AnalyticsService;
import com.example.group3.dashboard.Service.DashboardService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class DashboardServiceImpl implements DashboardService {

    private final AnalyticsService analyticsService;

    public DashboardServiceImpl(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @Override
    public DashboardOverviewResponse getOverview() {
        DashboardOverviewResponse response = new DashboardOverviewResponse();
        response.setSummary(analyticsService.getPortfolioSummary());
        response.setAllocation(analyticsService.getAllocation());
        response.setTopHoldings(analyticsService.getTopHoldings());
        //response.setRiskAlerts(buildPlaceholderRiskAlerts());
        response.setAiSummaryPlaceholder("Portfolio overview is ready. AI insights will be available in Phase 3.");
        return response;
    }

//    private List<RiskAlertResponse> buildPlaceholderRiskAlerts() {
//        List<RiskAlertResponse> alerts = new ArrayList<>();
//
//        RiskAlertResponse alert = new RiskAlertResponse();
//        alert.setCode("PHASE1_PLACEHOLDER");
//        alert.setLevel("INFO");
//        alert.setTitle("Risk check placeholder");
//        alert.setMessage("Detailed risk rules will be added in Phase 2.");
//        alerts.add(alert);
//
//        return alerts;
//    }
}