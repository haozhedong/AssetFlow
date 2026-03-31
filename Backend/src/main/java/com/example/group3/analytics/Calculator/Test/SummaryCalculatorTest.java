package com.example.group3.analytics.Calculator.Test;

import com.example.group3.analytics.Calculator.SummaryCalculator;
import com.example.group3.analytics.dto.HoldingSnapshot;
import com.example.group3.analytics.dto.PortfolioSummaryResponse;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class SummaryCalculatorTest {

    private final SummaryCalculator calculator = new SummaryCalculator();

    @Test
    void shouldCalculatePortfolioSummaryCorrectly() {
        List<HoldingSnapshot> snapshots = MockDataFactory.buildSnapshots();

        PortfolioSummaryResponse response = calculator.calculate(snapshots);

        assertEquals(new BigDecimal("6480.00"), response.getTotalCost());
        assertEquals(new BigDecimal("6820.00"), response.getTotalMarketValue());
        assertEquals(new BigDecimal("340.00"), response.getUnrealizedPnl());
        assertEquals(new BigDecimal("5.25"), response.getReturnPct());
        assertEquals(3, response.getHoldingCount());
        System.out.println(response);
    }
}