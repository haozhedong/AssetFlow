package com.example.group3.market.provider;

import com.example.group3.market.dto.PriceResponseDTO;

public interface MarketDataProvider {
    PriceResponseDTO fetchPrice(Long assetId);
}
