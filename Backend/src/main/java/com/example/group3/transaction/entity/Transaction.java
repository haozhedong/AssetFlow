package com.example.group3.transaction.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.Data;

@Data
public class Transaction {

    private Long id;

    private Long assetId;
    private String transactionType; // buy/sell
    private BigDecimal quantity;
    private BigDecimal price;
    private BigDecimal fee;
    private LocalDateTime transactionDate;
    private String accountName;
    private String notes;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
