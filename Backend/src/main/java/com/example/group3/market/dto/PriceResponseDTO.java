package com.example.group3.market.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class PriceResponseDTO {
    private Long assetId;
    private LocalDate snapshotDate;
    private BigDecimal price;
    private String currency;
    private String source;
    private LocalDateTime fetchedAt;
}
