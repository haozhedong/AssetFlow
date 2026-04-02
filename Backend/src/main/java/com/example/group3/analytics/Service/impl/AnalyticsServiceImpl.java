package com.example.group3.analytics.Service.impl;

import com.example.group3.Asset.Entity.Asset;
import com.example.group3.Asset.Mapper.AssetMapper;
import com.example.group3.Holding.Entity.Holding;
import com.example.group3.Holding.Mapper.HoldingMapper;
import com.example.group3.analytics.Calculator.AllocationCalculator;
import com.example.group3.analytics.Calculator.SummaryCalculator;
import com.example.group3.analytics.Calculator.TopHoldingCalculator;
import com.example.group3.analytics.Service.AnalyticsService;
import com.example.group3.analytics.dto.AllocationItemResponse;
import com.example.group3.analytics.dto.HoldingSnapshot;
import com.example.group3.analytics.dto.PortfolioSummaryResponse;
import com.example.group3.analytics.dto.TopHoldingItemResponse;
import com.example.group3.market.dto.PriceResponseDTO;
import com.example.group3.market.entity.PriceSnapshot;
import com.example.group3.market.provider.FinnhubMarketDataProvider;
import com.example.group3.market.repository.PriceSnapshotMapper;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class AnalyticsServiceImpl implements AnalyticsService {

    private final SummaryCalculator summaryCalculator;
    private final AllocationCalculator allocationCalculator;
    private final TopHoldingCalculator topHoldingCalculator;

    private final HoldingMapper holdingMapper;
    private final AssetMapper assetMapper;
    private final PriceSnapshotMapper priceSnapshotMapper;
    private final FinnhubMarketDataProvider marketDataProvider;

    public AnalyticsServiceImpl(SummaryCalculator summaryCalculator,
                                AllocationCalculator allocationCalculator,
                                TopHoldingCalculator topHoldingCalculator,
                                HoldingMapper holdingMapper,
                                AssetMapper assetMapper,
                                PriceSnapshotMapper priceSnapshotMapper,
                                FinnhubMarketDataProvider marketDataProvider) {
        this.summaryCalculator = summaryCalculator;
        this.allocationCalculator = allocationCalculator;
        this.topHoldingCalculator = topHoldingCalculator;
        this.holdingMapper = holdingMapper;
        this.assetMapper = assetMapper;
        this.priceSnapshotMapper = priceSnapshotMapper;
        this.marketDataProvider = marketDataProvider;
    }

    @Override
    public PortfolioSummaryResponse getPortfolioSummary() {
        return summaryCalculator.calculate(loadSnapshotsFromDb());
    }

    @Override
    public List<AllocationItemResponse> getAllocation() {
        return allocationCalculator.calculateByAssetType(loadSnapshotsFromDb());
    }

    @Override
    public List<TopHoldingItemResponse> getTopHoldings() {
        return topHoldingCalculator.calculateTopHoldings(loadSnapshotsFromDb(), 5);
    }

    private List<HoldingSnapshot> loadSnapshotsFromDb() {
        List<Holding> holdings = holdingMapper.findAll();
        List<HoldingSnapshot> snapshots = new ArrayList<>();

        for (Holding holding : holdings) {
            if (holding == null || holding.getQuantity() == null) {
                continue;
            }

            if (holding.getQuantity().compareTo(BigDecimal.ZERO) <= 0) {
                continue;
            }

            Asset asset = assetMapper.findById(holding.getAssetId());
            if (asset == null) {
                continue;
            }

            BigDecimal latestPrice = null;

            // 1. 优先走实时价格，和 Holdings 页面保持一致
            try {
                PriceResponseDTO livePriceResponse = marketDataProvider.fetchPrice(holding.getAssetId());
                if (livePriceResponse != null
                        && livePriceResponse.getPrice() != null
                        && livePriceResponse.getPrice().compareTo(BigDecimal.ZERO) > 0) {
                    latestPrice = livePriceResponse.getPrice();
                }
            } catch (Exception e) {
                System.out.println("Failed to fetch live price for assetId=" + holding.getAssetId()
                        + ", fallback to snapshot/averageCost");
            }

            // 2. 实时价格失败时，退回 price_snapshots
            if (latestPrice == null) {
                PriceSnapshot latestPriceSnapshot = priceSnapshotMapper.selectLatestByAssetId(holding.getAssetId());
                if (latestPriceSnapshot != null
                        && latestPriceSnapshot.getPrice() != null
                        && latestPriceSnapshot.getPrice().compareTo(BigDecimal.ZERO) > 0) {
                    latestPrice = latestPriceSnapshot.getPrice();
                }
            }

            // 3. 再不行才退回 averageCost，至少不报错
            if (latestPrice == null) {
                latestPrice = holding.getAverageCost() == null ? BigDecimal.ZERO : holding.getAverageCost();
            }

            HoldingSnapshot snapshot = new HoldingSnapshot();
            snapshot.setHoldingId(holding.getId());
            snapshot.setAssetId(holding.getAssetId());
            snapshot.setSymbol(asset.getSymbol());
            snapshot.setAssetName(asset.getName());
            snapshot.setAssetType(asset.getAssetType());
            snapshot.setQuantity(holding.getQuantity());
            snapshot.setAverageCost(holding.getAverageCost() == null ? BigDecimal.ZERO : holding.getAverageCost());
            snapshot.setLatestPrice(latestPrice);

            snapshots.add(snapshot);
        }

        return snapshots;
    }
}