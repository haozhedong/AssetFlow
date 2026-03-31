package com.example.group3.dashboard.Controller;

import com.example.group3.analytics.dto.DashboardOverviewResponse;
import com.example.group3.dashboard.Service.DashboardService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/overview")
    public DashboardOverviewResponse getOverview() {
        return dashboardService.getOverview();
    }
}