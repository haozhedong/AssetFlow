package com.example.group3.Holding.Service;

import com.example.group3.Holding.DTO.*;
import com.example.group3.common.Response.PageResponse;

import java.math.BigDecimal;
import java.util.List;

public interface HoldingService {

    PageResponse<HoldingDetailResponse> getSelectAllHoldings(HoldingQueryRequest request);
    List<HoldingDetailResponse> getAllHoldings();
    HoldingDetailResponse getDetailHoldingById(Long id);
    HoldingResponse getHoldingById(Long id);
    HoldingResponse createHolding(CreateHoldingRequest request);
    HoldingDetailResponse updateHolding(Long id, UpdateHoldingRequest request);

    void deleteHolding(Long id);
    void applyBuy(Long assetId, BigDecimal qty, BigDecimal price, BigDecimal fee, String accountName);
    void applySell(Long assetId, BigDecimal qty, BigDecimal price, BigDecimal fee, String accountName);
}
