package com.example.group3.market.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
public class MarketIntelligenceResponseDTO {
    private String symbol;
    private BigDecimal currentPrice;
    private String currency;
    private List<Map<String, Object>> kline; // K线
    private Map<String, BigDecimal> indicator; // 指标 MA/EMA
}