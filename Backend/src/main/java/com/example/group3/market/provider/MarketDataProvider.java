package com.example.group3.market.provider;

import com.example.group3.market.dto.PriceResponseDTO;

public interface MarketDataProvider {
    // 获取单个资产最新价格
    PriceResponseDTO getLatestPrice(Long assetId, String symbol);
    // 刷新所有资产价格
    void refreshAllPrices();
}
