package com.example.group3.analytics.Controller;

import com.example.group3.analytics.dto.AllocationItemResponse;
import com.example.group3.analytics.dto.PortfolioSummaryResponse;
import com.example.group3.analytics.dto.TopHoldingItemResponse;
import com.example.group3.analytics.Service.AnalyticsService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/portfolio")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/summary")
    public PortfolioSummaryResponse getSummary() {
        return analyticsService.getPortfolioSummary();
    }

    @GetMapping("/allocation")
    public List<AllocationItemResponse> getAllocation() {
        return analyticsService.getAllocation();
    }

    @GetMapping("/top-holdings")
    public List<TopHoldingItemResponse> getTopHoldings() {
        return analyticsService.getTopHoldings();
    }
}