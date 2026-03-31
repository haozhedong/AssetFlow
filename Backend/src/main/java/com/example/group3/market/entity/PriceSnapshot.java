package com.example.group3.market.entity;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class PriceSnapshot {
    private Long id;

    // 资产ID
    private Long assetId;
    // 资产代码（如 BTC/USD、AAPL）
    private String symbol;
    // 当前价格
    private BigDecimal price;
    // 24h 涨跌额
    private BigDecimal change;
    // 24h 涨跌幅
    private BigDecimal changePercent;
    // 24h 最高价
    private BigDecimal high24h;
    // 24h 最低价
    private BigDecimal low24h;
    // 成交量
    private BigDecimal volume24h;

    // 快照时间
    private LocalDateTime snapshotTime;
}
