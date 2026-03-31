package com.example.group3.dashboard.Service;

import com.example.group3.analytics.dto.DashboardFullResponse;
import com.example.group3.analytics.dto.DashboardOverviewResponse;

public interface DashboardService {
    DashboardOverviewResponse getOverview();
    DashboardFullResponse getFullDashboard();
}