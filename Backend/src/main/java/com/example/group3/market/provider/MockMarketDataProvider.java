package com.example.group3.market.provider;

import com.example.group3.market.dto.PriceResponseDTO;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.Random;

@Component
public class MockMarketDataProvider implements MarketDataProvider {

    private final Random random = new Random();

    @Override
    public PriceResponseDTO getLatestPrice(Long assetId, String symbol) {
        PriceResponseDTO dto = new PriceResponseDTO();
        dto.setAssetId(assetId);
        dto.setSymbol(symbol);

        // 模拟随机价格
        BigDecimal basePrice = new BigDecimal(10000);
        BigDecimal randomOffset = new BigDecimal(random.nextDouble() * 1000);
        BigDecimal price = basePrice.add(randomOffset).setScale(4, RoundingMode.HALF_UP);

        dto.setPrice(price);
        dto.setChange(price.multiply(new BigDecimal("0.02")));
        dto.setChangePercent(new BigDecimal("2.00"));
        dto.setHigh24h(price.multiply(new BigDecimal("1.05")));
        dto.setLow24h(price.multiply(new BigDecimal("0.95")));
        dto.setVolume24h(new BigDecimal(random.nextInt(1000000)));
        dto.setSnapshotTime(LocalDateTime.now());

        return dto;
    }

    @Override
    public void refreshAllPrices() {
        // 模拟刷新全部资产
        System.out.println("已刷新所有资产行情价格");
    }
}
