package com.example.group3.market.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class PriceResponseDTO {
    private Long assetId;
    private String symbol;
    private BigDecimal price;
    private BigDecimal change;
    private BigDecimal changePercent;
    private BigDecimal high24h;
    private BigDecimal low24h;
    private BigDecimal volume24h;
    private LocalDateTime snapshotTime;
}
