package com.example.group3.market.dto;

import lombok.Data;

import java.time.LocalDate;


@Data
public class HistoryPriceQueryDTO {
    private Long assetId;
    private LocalDate startDate;
    private LocalDate endDate;
}
