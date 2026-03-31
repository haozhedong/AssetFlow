package com.example.group3.analytics.Service;

import com.example.group3.analytics.dto.AllocationItemResponse;
import com.example.group3.analytics.dto.PortfolioSummaryResponse;
import com.example.group3.analytics.dto.TopHoldingItemResponse;

import java.util.List;

public interface AnalyticsService {
    PortfolioSummaryResponse getPortfolioSummary();
    List<AllocationItemResponse> getAllocation();
    List<TopHoldingItemResponse> getTopHoldings();
}