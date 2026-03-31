package com.example.group3.market.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class HistoryPriceQueryDTO {
    private Long assetId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
}
