package com.example.group3.transaction.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class TransactionDTO {
    private String symbol;
    private String transactionType;
    private BigDecimal quantity;
    private BigDecimal fee;
    private String accountName;
    private String notes;
}
