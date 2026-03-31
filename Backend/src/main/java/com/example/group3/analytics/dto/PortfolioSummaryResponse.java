package com.example.group3.analytics.dto;

import java.math.BigDecimal;

/**
 * 持仓总览（
 * @author: Luke
 * GET /api/portfolio/summary
 */

public class PortfolioSummaryResponse {
    private BigDecimal totalCost; //持仓总成本
    private BigDecimal totalMarketValue; //持仓总市值
    private BigDecimal unrealizedPnl; //总盈亏
    private BigDecimal returnPct; //收益率
    private Integer holdingCount; //持仓数量

    public BigDecimal getTotalCost() {
        return totalCost;
    }

    public void setTotalCost(BigDecimal totalCost) {
        this.totalCost = totalCost;
    }

    public BigDecimal getTotalMarketValue() {
        return totalMarketValue;
    }

    public void setTotalMarketValue(BigDecimal totalMarketValue) {
        this.totalMarketValue = totalMarketValue;
    }

    public BigDecimal getUnrealizedPnl() {
        return unrealizedPnl;
    }

    public void setUnrealizedPnl(BigDecimal unrealizedPnl) {
        this.unrealizedPnl = unrealizedPnl;
    }

    public BigDecimal getReturnPct() {
        return returnPct;
    }

    public void setReturnPct(BigDecimal returnPct) {
        this.returnPct = returnPct;
    }

    public Integer getHoldingCount() {
        return holdingCount;
    }

    public void setHoldingCount(Integer holdingCount) {
        this.holdingCount = holdingCount;
    }

    @Override
    public String toString() {
        return "PortfolioSummaryResponse{" +
                "totalCost=" + totalCost +
                ", totalMarketValue=" + totalMarketValue +
                ", unrealizedPnl=" + unrealizedPnl +
                ", returnPct=" + returnPct +
                ", holdingCount=" + holdingCount +
                '}';
    }
}
