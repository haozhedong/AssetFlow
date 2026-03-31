package com.example.group3.market.provider;

import com.example.group3.market.dto.PriceResponseDTO;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Random;

@Component
public class MockMarketDataProvider implements MarketDataProvider {

    private final Random random = new Random();

    @Override
    public PriceResponseDTO fetchPrice(Long assetId) {
        PriceResponseDTO dto = new PriceResponseDTO();
        dto.setAssetId(assetId);
        dto.setSnapshotDate(LocalDate.now());
        dto.setPrice(new BigDecimal(random.nextDouble() * 50000).setScale(4, RoundingMode.HALF_UP));
        dto.setCurrency("USD");
        dto.setSource("MOCK");
        dto.setFetchedAt(LocalDateTime.now());
        return dto;
    }
}
