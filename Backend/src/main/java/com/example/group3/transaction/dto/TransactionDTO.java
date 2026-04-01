package com.example.group3.transaction.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class TransactionDTO {
    private String symbol;
    private String transactionType;
    private BigDecimal quantity;
    private BigDecimal price;
    private BigDecimal fee;
    private LocalDateTime transactionDate;
    private String accountName;
    private String notes;
}
