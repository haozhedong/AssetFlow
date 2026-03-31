package com.example.group3.analytics.Calculator.Test;

import com.example.group3.analytics.dto.HoldingSnapshot;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class MockDataFactory {

    public static List<HoldingSnapshot> buildSnapshots() {
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