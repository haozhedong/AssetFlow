package com.example.group3.Holding.Service.impl;

import com.example.group3.Asset.Entity.Asset;
import com.example.group3.Asset.Mapper.AssetMapper;
import com.example.group3.Holding.DTO.*;
import com.example.group3.Holding.Entity.Holding;
import com.example.group3.Holding.Mapper.HoldingMapper;
import com.example.group3.Holding.Service.HoldingService;
import com.example.group3.common.Response.PageResponse;
import com.example.group3.market.dto.PriceResponseDTO;
import com.example.group3.market.entity.PriceSnapshot;
import com.example.group3.market.provider.FinnhubMarketDataProvider;
import com.example.group3.market.repository.PriceSnapshotMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;
import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@RequiredArgsConstructor
public class HoldingServiceImpl implements HoldingService {
    private final HoldingMapper holdingMapper;
    private final AssetMapper assetMapper;
    private final FinnhubMarketDataProvider marketDataProvider;

    @Override
    public List<HoldingDetailResponse> getAllHoldings() {
        return holdingMapper.findAll()
                .stream()
                .map(this::toDetailResponse)
                .collect(Collectors.toList());
    }

    @Override
    public PageResponse<HoldingDetailResponse> getSelectAllHoldings(HoldingQueryRequest request) {
        List<HoldingDetailResponse> allRecords = holdingMapper.findAll()
                .stream()
                .map(this::toDetailResponse)
                .collect(Collectors.toList());

        List<HoldingDetailResponse> filtered = allRecords.stream()
                .filter(item -> matchKeyword(item, request.getKeyword()))
                .filter(item -> matchAssetType(item, request.getAssetType()))
                .filter(item -> matchMarket(item, request.getMarket()))
                .filter(item -> matchAccountName(item, request.getAccountName()))
                .collect(Collectors.toList());

        sortHoldings(filtered, request.getSortBy(), request.getSortDir());

        int page = request.getPage() == null || request.getPage() < 1 ? 1 : request.getPage();
        int pageSize = request.getPageSize() == null || request.getPageSize() < 1 ? 10 : request.getPageSize();

        int fromIndex = (page - 1) * pageSize;
        int toIndex = Math.min(fromIndex + pageSize, filtered.size());

        List<HoldingDetailResponse> pageRecords = new ArrayList<>();
        if (fromIndex < filtered.size()) {
            pageRecords = filtered.subList(fromIndex, toIndex);
        }

        PageResponse<HoldingDetailResponse> response = new PageResponse<>();
        response.setRecords(pageRecords);
        response.setTotal((long) filtered.size());
        response.setPage(page);
        response.setPageSize(pageSize);

        return response;
    }

    //关键词搜索 -- AssetSymbol / AssetName
    private boolean matchKeyword(HoldingDetailResponse item, String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return true;
        }
        String lowerKeyword = keyword.toLowerCase(Locale.ROOT);

        return containsIgnoreCase(item.getAssetSymbol(), lowerKeyword)
                || containsIgnoreCase(item.getAssetName(), lowerKeyword);
    }

    //AssetType匹配
    private boolean matchAssetType(HoldingDetailResponse item, String assetType) {
        if (assetType == null || assetType.isBlank()) {
            return true;
        }
        return assetType.equalsIgnoreCase(item.getAssetType());
    }

    //Market类型匹配
    private boolean matchMarket(HoldingDetailResponse item, String market) {
        if (market == null || market.isBlank()) {
            return true;
        }
        return market.equalsIgnoreCase(item.getMarket());
    }

    //账户名匹配
    private boolean matchAccountName(HoldingDetailResponse item, String accountName) {
        if (accountName == null || accountName.isBlank()) {
            return true;
        }
        return containsIgnoreCase(item.getAccountName(), accountName.toLowerCase(Locale.ROOT));
    }

    private boolean containsIgnoreCase(String source, String lowerKeyword) {
        return source != null && source.toLowerCase(Locale.ROOT).contains(lowerKeyword);
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

    //Holding列表根据ID/assetSymbol/quantity/averageCost/latestPrice/marketValue/unrealizedPnl排序
    private void sortHoldings(List<HoldingDetailResponse> list, String sortBy, String sortDir) {
        Comparator<HoldingDetailResponse> comparator;

        switch (sortBy == null ? "id" : sortBy) {
            case "assetSymbol":
                comparator = Comparator.comparing(
                        item -> item.getAssetSymbol() == null ? "" : item.getAssetSymbol(),
                        String.CASE_INSENSITIVE_ORDER
                );
                break;
            case "quantity":
                comparator = Comparator.comparing(
                        item -> item.getQuantity() == null ? BigDecimal.ZERO : item.getQuantity()
                );
                break;
            case "averageCost":
                comparator = Comparator.comparing(
                        item -> item.getAverageCost() == null ? BigDecimal.ZERO : item.getAverageCost()
                );
                break;
            case "latestPrice":
                comparator = Comparator.comparing(
                        item -> item.getLatestPrice() == null ? BigDecimal.ZERO : item.getLatestPrice()
                );
                break;
            case "marketValue":
                comparator = Comparator.comparing(
                        item -> item.getMarketValue() == null ? BigDecimal.ZERO : item.getMarketValue()
                );
                break;
            case "unrealizedPnl":
                comparator = Comparator.comparing(
                        item -> item.getUnrealizedPnl() == null ? BigDecimal.ZERO : item.getUnrealizedPnl()
                );
                break;
            default:
                comparator = Comparator.comparing(
                        item -> item.getId() == null ? 0L : item.getId()
                );
                break;
        }

        if ("desc".equalsIgnoreCase(sortDir)) {
            comparator = comparator.reversed();
        }

        list.sort(comparator);
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

        // 获取实时价格
        assetMapper.insert(asset);

        PriceResponseDTO latestPriceResponse = marketDataProvider.fetchPrice(holding.getAssetId());

        if (latestPriceResponse != null) {
            BigDecimal latestPrice = latestPriceResponse.getPrice();
            response.setLatestPrice(latestPrice);
            response.setPriceSnapshotTime(latestPriceResponse.getFetchedAt());

            BigDecimal marketValue = holding.getQuantity().multiply(latestPrice);
            response.setMarketValue(marketValue);

            BigDecimal costBasis = holding.getQuantity().multiply(holding.getAverageCost());
            BigDecimal unrealizedPnl = marketValue.subtract(costBasis);
            response.setUnrealizedPnl(unrealizedPnl);

            if (costBasis.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal pnlPercent = unrealizedPnl
                        .divide(costBasis, 2, RoundingMode.HALF_UP)
                        .multiply(new BigDecimal("100"));
                response.setPnlPercent(pnlPercent);
            }
        }

        return response;
    }
}
