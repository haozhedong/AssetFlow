package com.example.group3.analytics.dto;

import java.math.BigDecimal;
import java.math.RoundingMode;

public class HoldingSnapshot {
    private Long holdingId; // 当前持仓记录的id
    private Long assetId; // 当前持仓的资产是什么？
    private String symbol;
    private String assetName;
    private String assetType;
    private BigDecimal quantity;
    private BigDecimal averageCost;
    private BigDecimal latestPrice;

    public BigDecimal getCost() {
        return quantity.multiply(averageCost).setScale(2, RoundingMode.HALF_UP);
    }

    public BigDecimal getMarketValue() {
        return quantity.multiply(latestPrice).setScale(2, RoundingMode.HALF_UP);
    }

    public BigDecimal getUnrealizedPnl() {
        return getMarketValue().subtract(getCost()).setScale(2, RoundingMode.HALF_UP);
    }

    public Long getHoldingId() {
        return holdingId;
    }

    public void setHoldingId(Long holdingId) {
        this.holdingId = holdingId;
    }

    public Long getAssetId() {
        return assetId;
    }

    public void setAssetId(Long assetId) {
        this.assetId = assetId;
    }

    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public String getAssetName() {
        return assetName;
    }

    public void setAssetName(String assetName) {
        this.assetName = assetName;
    }

    public String getAssetType() {
        return assetType;
    }

    public void setAssetType(String assetType) {
        this.assetType = assetType;
    }

    public BigDecimal getQuantity() {
        return quantity;
    }

    public void setQuantity(BigDecimal quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getAverageCost() {
        return averageCost;
    }

    public void setAverageCost(BigDecimal averageCost) {
        this.averageCost = averageCost;
    }

    public BigDecimal getLatestPrice() {
        return latestPrice;
    }

    public void setLatestPrice(BigDecimal latestPrice) {
        this.latestPrice = latestPrice;
    }
}
