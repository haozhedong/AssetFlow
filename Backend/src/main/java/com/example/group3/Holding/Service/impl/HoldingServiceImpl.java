package com.example.group3.Holding.Service.impl;

import com.example.group3.Asset.Entity.Asset;
import com.example.group3.Asset.Mapper.AssetMapper;
import com.example.group3.Holding.DTO.CreateHoldingRequest;
import com.example.group3.Holding.DTO.HoldingResponse;
import com.example.group3.Holding.DTO.UpdateHoldingRequest;
import com.example.group3.Holding.Entity.Holding;
import com.example.group3.Holding.Mapper.HoldingMapper;
import com.example.group3.Holding.Service.HoldingService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class HoldingServiceImpl implements HoldingService {
    private final HoldingMapper holdingMapper;
    private final AssetMapper assetMapper;

    public HoldingServiceImpl(HoldingMapper holdingMapper, AssetMapper assetMapper) {
        this.holdingMapper = holdingMapper;
        this.assetMapper = assetMapper;
    }

    @Override
    public List<HoldingResponse> getAllHoldings() {
        return holdingMapper.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public HoldingResponse getHoldingById(Long id) {
        Holding holding = holdingMapper.findById(id);
        if (holding == null) {
            throw new RuntimeException("Holding not found, id = " + id);
        }
        return toResponse(holding);
    }

    @Override
    public HoldingResponse createHolding(CreateHoldingRequest request) {
        validateAssetExists(request.getAssetId());

        Holding holding = new Holding();
        holding.setAssetId(request.getAssetId());
        holding.setQuantity(request.getQuantity());
        holding.setAverageCost(request.getAverageCost());
        holding.setCostCurrency(request.getCostCurrency());
        holding.setPurchaseDate(request.getPurchaseDate());
        holding.setAccountName(request.getAccountName());
        holding.setNotes(request.getNotes());

        holdingMapper.insert(holding);
        return toResponse(holdingMapper.findById(holding.getId()));
    }

    @Override
    public HoldingResponse updateHolding(Long id, UpdateHoldingRequest request) {
        Holding existingHolding = holdingMapper.findById(id);
        if (existingHolding == null) {
            throw new RuntimeException("Holding not found, id = " + id);
        }

        validateAssetExists(request.getAssetId());

        existingHolding.setAssetId(request.getAssetId());
        existingHolding.setQuantity(request.getQuantity());
        existingHolding.setAverageCost(request.getAverageCost());
        existingHolding.setCostCurrency(request.getCostCurrency());
        existingHolding.setPurchaseDate(request.getPurchaseDate());
        existingHolding.setAccountName(request.getAccountName());
        existingHolding.setNotes(request.getNotes());

        holdingMapper.updateById(existingHolding);
        return toResponse(holdingMapper.findById(id));
    }

    @Override
    public void deleteHolding(Long id) {
        Holding existingHolding = holdingMapper.findById(id);
        if (existingHolding == null) {
            throw new RuntimeException("Holding not found, id = " + id);
        }

        holdingMapper.deleteById(id);
    }

    private void validateAssetExists(Long assetId) {
        Asset asset = assetMapper.findById(assetId);
        if (asset == null) {
            throw new RuntimeException("Asset not found, assetId = " + assetId);
        }
    }

    private HoldingResponse toResponse(Holding holding) {
        HoldingResponse response = new HoldingResponse();
        response.setId(holding.getId());
        response.setAssetId(holding.getAssetId());
        response.setQuantity(holding.getQuantity());
        response.setAverageCost(holding.getAverageCost());
        response.setCostCurrency(holding.getCostCurrency());
        response.setPurchaseDate(holding.getPurchaseDate());
        response.setAccountName(holding.getAccountName());
        response.setNotes(holding.getNotes());
        response.setCreatedAt(holding.getCreatedAt());
        response.setUpdatedAt(holding.getUpdatedAt());
        return response;
    }
}
