package com.example.group3.Holding.DTO;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public class CreateHoldingRequest {
    @NotNull(message = "assetId cannot be null")
    private Long assetId;

    @NotNull(message = "quantity cannot be null")
    @DecimalMin(value = "0.0001", message = "quantity must be greater than 0")
    private BigDecimal quantity;

    @NotNull(message = "averageCost cannot be null")
    @DecimalMin(value = "0.0", inclusive = false, message = "averageCost must be greater than 0")
    private BigDecimal averageCost;

    private String costCurrency;
    private LocalDate purchaseDate;
    private String accountName;
    private String notes;

    public CreateHoldingRequest() {
    }

    public Long getAssetId() {
        return assetId;
    }

    public void setAssetId(Long assetId) {
        this.assetId = assetId;
    }

    public BigDecimal getQuantity() {
        return quantity;
    }

    public void setQuantity(BigDecimal quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getAverageCost() {
        return averageCost;
    }

    public void setAverageCost(BigDecimal averageCost) {
        this.averageCost = averageCost;
    }

    public String getCostCurrency() {
        return costCurrency;
    }

    public void setCostCurrency(String costCurrency) {
        this.costCurrency = costCurrency;
    }

    public LocalDate getPurchaseDate() {
        return purchaseDate;
    }

    public void setPurchaseDate(LocalDate purchaseDate) {
        this.purchaseDate = purchaseDate;
    }

    public String getAccountName() {
        return accountName;
    }

    public void setAccountName(String accountName) {
        this.accountName = accountName;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
