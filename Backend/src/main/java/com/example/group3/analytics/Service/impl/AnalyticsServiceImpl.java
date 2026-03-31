package com.example.group3.analytics.Service.impl;

import com.example.group3.analytics.Calculator.AllocationCalculator;
import com.example.group3.analytics.Calculator.SummaryCalculator;
import com.example.group3.analytics.Calculator.TopHoldingCalculator;
import com.example.group3.analytics.dto.AllocationItemResponse;
import com.example.group3.analytics.dto.HoldingSnapshot;
import com.example.group3.analytics.dto.PortfolioSummaryResponse;
import com.example.group3.analytics.dto.TopHoldingItemResponse;
import com.example.group3.analytics.Service.AnalyticsService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * @Description: Mock Version
 */

@Service
public class AnalyticsServiceImpl implements AnalyticsService {

    private final SummaryCalculator summaryCalculator;
    private final AllocationCalculator allocationCalculator;
    private final TopHoldingCalculator topHoldingCalculator;

    public AnalyticsServiceImpl(SummaryCalculator summaryCalculator,
                                AllocationCalculator allocationCalculator,
                                TopHoldingCalculator topHoldingCalculator) {
        this.summaryCalculator = summaryCalculator;
        this.allocationCalculator = allocationCalculator;
        this.topHoldingCalculator = topHoldingCalculator;
    }

    @Override
    public PortfolioSummaryResponse getPortfolioSummary() {
        return summaryCalculator.calculate(loadMockSnapshots());
    }

    @Override
    public List<AllocationItemResponse> getAllocation() {
        return allocationCalculator.calculateByAssetType(loadMockSnapshots());
    }

    @Override
    public List<TopHoldingItemResponse> getTopHoldings() {
        return topHoldingCalculator.calculateTopHoldings(loadMockSnapshots(), 5);
    }

    private List<HoldingSnapshot> loadMockSnapshots() {
        List<HoldingSnapshot> list = new ArrayList<>();

        HoldingSnapshot a = new HoldingSnapshot();
        a.setHoldingId(1L);
        a.setAssetId(101L);
        a.setSymbol("AAPL");
        a.setAssetName("Apple Inc.");
        a.setAssetType("STOCK");
        a.setQuantity(new BigDecimal("10"));
        a.setAverageCost(new BigDecimal("180"));
        a.setLatestPrice(new BigDecimal("195"));
        list.add(a);

        HoldingSnapshot b = new HoldingSnapshot();
        b.setHoldingId(2L);
        b.setAssetId(102L);
        b.setSymbol("VOO");
        b.setAssetName("Vanguard S&P 500 ETF");
        b.setAssetType("ETF");
        b.setQuantity(new BigDecimal("8"));
        b.setAverageCost(new BigDecimal("450"));
        b.setLatestPrice(new BigDecimal("470"));
        list.add(b);

        HoldingSnapshot c = new HoldingSnapshot();
        c.setHoldingId(3L);
        c.setAssetId(103L);
        c.setSymbol("BND");
        c.setAssetName("Vanguard Total Bond Market ETF");
        c.setAssetType("BOND");
        c.setQuantity(new BigDecimal("15"));
        c.setAverageCost(new BigDecimal("72"));
        c.setLatestPrice(new BigDecimal("74"));
        list.add(c);

        return list;
    }
}