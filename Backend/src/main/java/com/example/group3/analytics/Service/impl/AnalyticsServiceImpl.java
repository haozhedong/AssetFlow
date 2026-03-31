package com.example.group3.analytics.Service.impl;

import com.example.group3.Asset.Entity.Asset;
import com.example.group3.Asset.Mapper.AssetMapper;
import com.example.group3.Holding.Entity.Holding;
import com.example.group3.Holding.Mapper.HoldingMapper;
import com.example.group3.analytics.Calculator.AllocationCalculator;
import com.example.group3.analytics.Calculator.SummaryCalculator;
import com.example.group3.analytics.Calculator.TopHoldingCalculator;
import com.example.group3.analytics.dto.AllocationItemResponse;
import com.example.group3.analytics.dto.HoldingSnapshot;
import com.example.group3.analytics.dto.PortfolioSummaryResponse;
import com.example.group3.analytics.dto.TopHoldingItemResponse;
import com.example.group3.analytics.Service.AnalyticsService;
import com.example.group3.market.entity.PriceSnapshot;
import com.example.group3.market.repository.PriceSnapshotMapper;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * @Description: Mock Version
 */

@Service
public class AnalyticsServiceImpl implements AnalyticsService {

    private final SummaryCalculator summaryCalculator;
    private final AllocationCalculator allocationCalculator;
    private final TopHoldingCalculator topHoldingCalculator;

    private final HoldingMapper holdingMapper;
    private final AssetMapper assetMapper;
    private final PriceSnapshotMapper priceSnapshotMapper;


    public AnalyticsServiceImpl(SummaryCalculator summaryCalculator,
                                AllocationCalculator allocationCalculator,
                                TopHoldingCalculator topHoldingCalculator, HoldingMapper holdingMapper, AssetMapper assetMapper, PriceSnapshotMapper priceSnapshotMapper) {
        this.summaryCalculator = summaryCalculator;
        this.allocationCalculator = allocationCalculator;
        this.topHoldingCalculator = topHoldingCalculator;
        this.holdingMapper = holdingMapper;
        this.assetMapper = assetMapper;
        this.priceSnapshotMapper = priceSnapshotMapper;
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

//    private List<HoldingSnapshot> loadMockSnapshots() {
//        List<HoldingSnapshot> list = new ArrayList<>();
//
//        HoldingSnapshot a = new HoldingSnapshot();
//        a.setHoldingId(1L);
//        a.setAssetId(101L);
//        a.setSymbol("AAPL");
//        a.setAssetName("Apple Inc.");
//        a.setAssetType("STOCK");
//        a.setQuantity(new BigDecimal("10"));
//        a.setAverageCost(new BigDecimal("180"));
//        a.setLatestPrice(new BigDecimal("195"));
//        list.add(a);
//
//        HoldingSnapshot b = new HoldingSnapshot();
//        b.setHoldingId(2L);
//        b.setAssetId(102L);
//        b.setSymbol("VOO");
//        b.setAssetName("Vanguard S&P 500 ETF");
//        b.setAssetType("ETF");
//        b.setQuantity(new BigDecimal("8"));
//        b.setAverageCost(new BigDecimal("450"));
//        b.setLatestPrice(new BigDecimal("470"));
//        list.add(b);
//
//        HoldingSnapshot c = new HoldingSnapshot();
//        c.setHoldingId(3L);
//        c.setAssetId(103L);
//        c.setSymbol("BND");
//        c.setAssetName("Vanguard Total Bond Market ETF");
//        c.setAssetType("BOND");
//        c.setQuantity(new BigDecimal("15"));
//        c.setAverageCost(new BigDecimal("72"));
//        c.setLatestPrice(new BigDecimal("74"));
//        list.add(c);
//
//        return list;
//    }

    private List<HoldingSnapshot> loadSnapshotsFromDb() {
        List<Holding> holdings = holdingMapper.findAll();
        List<HoldingSnapshot> snapshots = new ArrayList<>(); // 结果合集

        for (Holding holding : holdings) {
            Asset asset = assetMapper.findById(holding.getAssetId());
            if (asset == null) {
                continue;
            }

            PriceSnapshot latestPriceSnapshot = priceSnapshotMapper.selectLatestByAssetId(holding.getAssetId());

            HoldingSnapshot snapshot = new HoldingSnapshot(); // 每条snapshot
            snapshot.setHoldingId(holding.getId());
            snapshot.setAssetId(holding.getAssetId());
            snapshot.setSymbol(asset.getSymbol());
            snapshot.setAssetName(asset.getName());
            snapshot.setAssetType(asset.getAssetType());
            snapshot.setQuantity(holding.getQuantity());
            snapshot.setAverageCost(holding.getAverageCost());

            if (latestPriceSnapshot != null && latestPriceSnapshot.getPrice() != null) {
                snapshot.setLatestPrice(latestPriceSnapshot.getPrice());
            } else {
                snapshot.setLatestPrice(holding.getAverageCost());
            }

            snapshots.add(snapshot);
        }

        return snapshots;
    }
}