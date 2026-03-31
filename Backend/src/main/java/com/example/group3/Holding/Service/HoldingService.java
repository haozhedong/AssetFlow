package com.example.group3.Holding.Service;

import com.example.group3.Holding.DTO.CreateHoldingRequest;
import com.example.group3.Holding.DTO.HoldingDetailResponse;
import com.example.group3.Holding.DTO.HoldingResponse;
import com.example.group3.Holding.DTO.UpdateHoldingRequest;

import java.math.BigDecimal;
import java.util.List;

public interface HoldingService {
    List<HoldingResponse> getAllHoldings();

    HoldingDetailResponse getDetailHoldingById(Long id);

    HoldingResponse getHoldingById(Long id);

    HoldingResponse createHolding(CreateHoldingRequest request);

    HoldingResponse updateHolding(Long id, UpdateHoldingRequest request);

    void deleteHolding(Long id);

    void applyBuy(Long assetId, BigDecimal qty, BigDecimal price, BigDecimal fee, String accountName);

    void applySell(Long assetId, BigDecimal qty, BigDecimal price, BigDecimal fee, String accountName);
}
