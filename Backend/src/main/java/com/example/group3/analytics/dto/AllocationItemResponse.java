package com.example.group3.analytics.dto;

import java.math.BigDecimal;

/**
 * 持仓分配
 * @author: Luke
 * GET /api/portfolio/allocation
 */

public class AllocationItemResponse {
    // In phase1 group_by = asset_type
    private String groupBy;      // asset_type / sector / currency
    private String groupValue;   // STOCK / ETF / USD ...
    private BigDecimal marketValue;
    private BigDecimal weightPct;

    public String getGroupBy() {
        return groupBy;
    }

    public void setGroupBy(String groupBy) {
        this.groupBy = groupBy;
    }

    public String getGroupValue() {
        return groupValue;
    }

    public void setGroupValue(String groupValue) {
        this.groupValue = groupValue;
    }

    public BigDecimal getMarketValue() {
        return marketValue;
    }

    public void setMarketValue(BigDecimal marketValue) {
        this.marketValue = marketValue;
    }

    public BigDecimal getWeightPct() {
        return weightPct;
    }

    public void setWeightPct(BigDecimal weightPct) {
        this.weightPct = weightPct;
    }
}
