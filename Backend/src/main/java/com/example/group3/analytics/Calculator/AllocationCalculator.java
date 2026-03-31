package com.example.group3.analytics.Calculator;

import com.example.group3.analytics.dto.AllocationItemResponse;
import com.example.group3.analytics.dto.HoldingSnapshot;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

/**
 * 计算资产占比
 * 把所有holding按assetType分组，然后计算占比
 */
@Component
public class AllocationCalculator {

    public List<AllocationItemResponse> calculateByAssetType(List<HoldingSnapshot> snapshots) {
        Map<String, BigDecimal> grouped = new HashMap<>();
        BigDecimal totalMarketValue = BigDecimal.ZERO;

        for (HoldingSnapshot snapshot : snapshots) {
            BigDecimal marketValue = snapshot.getMarketValue();
            totalMarketValue = totalMarketValue.add(marketValue);

            grouped.put(
                    snapshot.getAssetType(),
                    grouped.getOrDefault(snapshot.getAssetType(), BigDecimal.ZERO).add(marketValue)
            );
        }

        List<AllocationItemResponse> result = new ArrayList<>();
        for (Map.Entry<String, BigDecimal> entry : grouped.entrySet()) {
            AllocationItemResponse item = new AllocationItemResponse();
            item.setGroupBy("asset_type");
            item.setGroupValue(entry.getKey());
            item.setMarketValue(entry.getValue().setScale(2, RoundingMode.HALF_UP));

            BigDecimal weightPct = BigDecimal.ZERO;
            if (totalMarketValue.compareTo(BigDecimal.ZERO) > 0) {
                weightPct = entry.getValue()
                        .divide(totalMarketValue, 4, RoundingMode.HALF_UP)
                        .multiply(new BigDecimal("100"))
                        .setScale(2, RoundingMode.HALF_UP);
            }
            item.setWeightPct(weightPct);

            result.add(item);
        }

        result.sort((a, b) -> b.getMarketValue().compareTo(a.getMarketValue()));
        return result;
    }
}