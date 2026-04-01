package com.example.group3.market.dto;

import lombok.Data;

@Data
public class MarketIntelligenceQueryDTO {
    private String interval; // 1D, 1W, 1M
    private Integer count;   // 条数
}
