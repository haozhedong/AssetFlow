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

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import com.example.group3.Holding.DTO.HoldingDetailResponse;
import java.math.BigDecimal;
import java.math.RoundingMode;

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
    public HoldingDetailResponse getDetailHoldingById(Long id) {
        Holding holding = holdingMapper.findById(id);
        if (holding == null) {
            throw new RuntimeException("Holding not found, id = " + id);
        }
        return toDetailResponse(holding);
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

        if (existingHolding.getQuantity() != null
                && existingHolding.getQuantity().compareTo(BigDecimal.ZERO) > 0) {
            throw new RuntimeException("Cannot delete holding with remaining quantity");
        }

        holdingMapper.deleteById(id);
    }

    private void validateAssetExists(Long assetId) {
        Asset asset = assetMapper.findById(assetId);
        if (asset == null) {
            throw new RuntimeException("Asset not found, assetId = " + assetId);
        }
    }

    @Override
    public void applyBuy(Long assetId, BigDecimal qty, BigDecimal price, BigDecimal fee, String accountName) {
        validateAssetExists(assetId);
        validateBuyInput(qty, price, fee);

        Holding existingHolding = holdingMapper.findByAssetId(assetId);
        BigDecimal safeFee = fee == null ? BigDecimal.ZERO : fee;

        if (existingHolding == null) {
            Holding newHolding = new Holding();
            newHolding.setAssetId(assetId);
            newHolding.setQuantity(qty);
            newHolding.setAverageCost(
                    qty.multiply(price).add(safeFee).divide(qty, 2, RoundingMode.HALF_UP)
            );
            newHolding.setCostCurrency("USD");
            newHolding.setAccountName(accountName);
            newHolding.setNotes("Created by buy transaction");

            holdingMapper.insert(newHolding);
            return;
        }

        BigDecimal oldQty = existingHolding.getQuantity();
        BigDecimal oldAvgCost = existingHolding.getAverageCost();

        BigDecimal totalOldCost = oldQty.multiply(oldAvgCost);
        BigDecimal totalNewCost = qty.multiply(price).add(safeFee);
        BigDecimal newQty = oldQty.add(qty);
        BigDecimal newAvgCost = totalOldCost.add(totalNewCost)
                .divide(newQty, 2, RoundingMode.HALF_UP);

        existingHolding.setQuantity(newQty);
        existingHolding.setAverageCost(newAvgCost);

        if (accountName != null && !accountName.isBlank()) {
            existingHolding.setAccountName(accountName);
        }

        holdingMapper.updateById(existingHolding);
    }

    @Override
    public void applySell(Long assetId, BigDecimal qty, BigDecimal price, BigDecimal fee, String accountName) {
        validateSellInput(qty, price, fee);

        Holding existingHolding = holdingMapper.findByAssetId(assetId);
        if (existingHolding == null) {
            throw new RuntimeException("Holding not found for assetId = " + assetId);
        }

        BigDecimal currentQty = existingHolding.getQuantity();
        if (qty.compareTo(currentQty) > 0) {
            throw new RuntimeException("Sell quantity exceeds current holding quantity");
        }

        BigDecimal newQty = currentQty.subtract(qty);
        existingHolding.setQuantity(newQty);

        if (newQty.compareTo(BigDecimal.ZERO) == 0) {
            existingHolding.setAverageCost(BigDecimal.ZERO);
            existingHolding.setNotes("Position closed by sell transaction");
        }

        if (accountName != null && !accountName.isBlank()) {
            existingHolding.setAccountName(accountName);
        }

        holdingMapper.updateById(existingHolding);
    }

    private void validateBuyInput(BigDecimal qty, BigDecimal price, BigDecimal fee) {
        if (qty == null || qty.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Buy quantity must be greater than 0");
        }
        if (price == null || price.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Buy price must be greater than 0");
        }
        if (fee != null && fee.compareTo(BigDecimal.ZERO) < 0) {
            throw new RuntimeException("Fee cannot be negative");
        }
    }

    private void validateSellInput(BigDecimal qty, BigDecimal price, BigDecimal fee) {
        if (qty == null || qty.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Sell quantity must be greater than 0");
        }
        if (price == null || price.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Sell price must be greater than 0");
        }
        if (fee != null && fee.compareTo(BigDecimal.ZERO) < 0) {
            throw new RuntimeException("Fee cannot be negative");
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

    private HoldingDetailResponse toDetailResponse(Holding holding) {
        HoldingDetailResponse response = new HoldingDetailResponse();
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

        Asset asset = assetMapper.findById(holding.getAssetId());
        if (asset != null) {
            response.setAssetSymbol(asset.getSymbol());
            response.setAssetName(asset.getName());
            response.setAssetType(asset.getAssetType());
            response.setMarket(asset.getMarket());
        }

        return response;
    }
}
