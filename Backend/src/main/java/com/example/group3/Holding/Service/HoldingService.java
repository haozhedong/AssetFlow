package com.example.group3.Holding.Service;

import com.example.group3.Holding.DTO.CreateHoldingRequest;
import com.example.group3.Holding.DTO.HoldingResponse;
import com.example.group3.Holding.DTO.UpdateHoldingRequest;

import java.util.List;

public interface HoldingService {
    List<HoldingResponse> getAllHoldings();

    HoldingResponse getHoldingById(Long id);

    HoldingResponse createHolding(CreateHoldingRequest request);

    HoldingResponse updateHolding(Long id, UpdateHoldingRequest request);

    void deleteHolding(Long id);
}
