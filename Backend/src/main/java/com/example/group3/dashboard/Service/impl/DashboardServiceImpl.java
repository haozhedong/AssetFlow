package com.example.group3.dashboard.Service.impl;

import com.example.group3.analytics.dto.*;
import com.example.group3.analytics.Service.AnalyticsService;
import com.example.group3.dashboard.Service.DashboardService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
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

    @Override
    public DashboardFullResponse getFullDashboard() {
        PortfolioSummaryResponse summary = analyticsService.getPortfolioSummary();
        List<AllocationItemResponse> allocation = analyticsService.getAllocation();

        DashboardFullResponse response = new DashboardFullResponse();
        response.setSummary(summary);
        response.setAllocation(allocation);
        response.setTopHoldings(analyticsService.getTopHoldings());

        response.setRiskLevel(calculateRiskLevel(summary, allocation));
        response.setDiversificationScore(calculateDiversificationScore(allocation));
        response.setRiskAlerts(buildRiskAlerts(summary, allocation));
        response.setAiSummaryPlaceholder("Portfolio overview is ready. AI insights will be available in Phase 3.");

        return response;
    }

    private String calculateRiskLevel(PortfolioSummaryResponse summary,
                                      List<AllocationItemResponse> allocation) {
        BigDecimal returnPct = summary.getReturnPct() == null ? BigDecimal.ZERO : summary.getReturnPct();
        BigDecimal maxWeight = findMaxWeight(allocation);

        if (maxWeight.compareTo(new BigDecimal("70")) > 0) {
            return "HIGH";
        }

        if (returnPct.compareTo(new BigDecimal("-10")) < 0) {
            return "HIGH";
        }

        if (maxWeight.compareTo(new BigDecimal("50")) > 0) {
            return "MEDIUM";
        }

        return "LOW";
    }

    private Integer calculateDiversificationScore(List<AllocationItemResponse> allocation) {
        if (allocation == null || allocation.isEmpty()) {
            return 0;
        }

        BigDecimal maxWeight = findMaxWeight(allocation);
        BigDecimal score = new BigDecimal("100").subtract(maxWeight);

        if (score.compareTo(BigDecimal.ZERO) < 0) {
            return 0;
        }

        return score.intValue();
    }

    private List<RiskAlertResponse> buildRiskAlerts(PortfolioSummaryResponse summary,
                                                    List<AllocationItemResponse> allocation) {
        List<RiskAlertResponse> alerts = new ArrayList<>();

        BigDecimal maxWeight = findMaxWeight(allocation);
        BigDecimal returnPct = summary.getReturnPct() == null ? BigDecimal.ZERO : summary.getReturnPct();

        if (maxWeight.compareTo(new BigDecimal("70")) > 0) {
            RiskAlertResponse alert = new RiskAlertResponse();
            alert.setCode("HIGH_CONCENTRATION");
            alert.setLevel("HIGH");
            alert.setTitle("Portfolio concentration is high");
            alert.setMessage("One asset type exceeds 70% of the portfolio. Diversification may be improved.");
            alerts.add(alert);
        } else if (maxWeight.compareTo(new BigDecimal("50")) > 0) {
            RiskAlertResponse alert = new RiskAlertResponse();
            alert.setCode("MEDIUM_CONCENTRATION");
            alert.setLevel("MEDIUM");
            alert.setTitle("Portfolio concentration is noticeable");
            alert.setMessage("One asset type exceeds 50% of the portfolio. Consider reviewing allocation balance.");
            alerts.add(alert);
        }

        if (returnPct.compareTo(new BigDecimal("-10")) < 0) {
            RiskAlertResponse alert = new RiskAlertResponse();
            alert.setCode("NEGATIVE_RETURN");
            alert.setLevel("HIGH");
            alert.setTitle("Portfolio return is significantly negative");
            alert.setMessage("Current unrealized return is below -10%. Review recent holdings and market exposure.");
            alerts.add(alert);
        } else if (returnPct.compareTo(BigDecimal.ZERO) < 0) {
            RiskAlertResponse alert = new RiskAlertResponse();
            alert.setCode("SLIGHT_LOSS");
            alert.setLevel("MEDIUM");
            alert.setTitle("Portfolio is currently at a loss");
            alert.setMessage("Current unrealized return is negative. This may be normal short-term fluctuation.");
            alerts.add(alert);
        }

        if (alerts.isEmpty()) {
            RiskAlertResponse alert = new RiskAlertResponse();
            alert.setCode("NO_MAJOR_RISK");
            alert.setLevel("INFO");
            alert.setTitle("No major risk alert");
            alert.setMessage("No major concentration or return warning is detected based on current rules.");
            alerts.add(alert);
        }

        return alerts;
    }

    private BigDecimal findMaxWeight(List<AllocationItemResponse> allocation) {
        BigDecimal maxWeight = BigDecimal.ZERO;

        if (allocation == null) {
            return maxWeight;
        }

        for (AllocationItemResponse item : allocation) {
            if (item.getWeightPct() != null && item.getWeightPct().compareTo(maxWeight) > 0) {
                maxWeight = item.getWeightPct();
            }
        }

        return maxWeight;
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