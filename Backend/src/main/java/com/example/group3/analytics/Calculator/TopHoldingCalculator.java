package com.example.group3.analytics.Calculator;

import com.example.group3.analytics.dto.HoldingSnapshot;
import com.example.group3.analytics.dto.TopHoldingItemResponse;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class TopHoldingCalculator {

    public List<TopHoldingItemResponse> calculateTopHoldings(List<HoldingSnapshot> snapshots, int limit) {
        BigDecimal totalMarketValue = snapshots.stream()
                .map(HoldingSnapshot::getMarketValue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return snapshots.stream()
                .sorted(Comparator.comparing(HoldingSnapshot::getMarketValue).reversed())
                .limit(limit)
                .map(snapshot -> {
                    TopHoldingItemResponse item = new TopHoldingItemResponse();
                    item.setHoldingId(snapshot.getHoldingId());
                    item.setAssetId(snapshot.getAssetId());
                    item.setSymbol(snapshot.getSymbol());
                    item.setAssetName(snapshot.getAssetName());
                    item.setAssetType(snapshot.getAssetType());
                    item.setQuantity(snapshot.getQuantity());
                    item.setAverageCost(snapshot.getAverageCost());
                    item.setLatestPrice(snapshot.getLatestPrice());
                    item.setMarketValue(snapshot.getMarketValue());
                    item.setUnrealizedPnl(snapshot.getUnrealizedPnl());

                    BigDecimal weightPct = BigDecimal.ZERO;
                    if (totalMarketValue.compareTo(BigDecimal.ZERO) > 0) {
                        weightPct = snapshot.getMarketValue()
                                .divide(totalMarketValue, 4, RoundingMode.HALF_UP)
                                .multiply(new BigDecimal("100"))
                                .setScale(2, RoundingMode.HALF_UP);
                    }
                    item.setWeightPct(weightPct);
                    return item;
                })
                .collect(Collectors.toList());
    }
}