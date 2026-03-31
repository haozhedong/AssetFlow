package com.example.group3.market.service;

import com.example.group3.market.dto.HistoryPriceQueryDTO;
import com.example.group3.market.dto.PriceResponseDTO;
import com.example.group3.market.entity.PriceSnapshot;

import java.util.List;

public interface MarketService {
    // 获取并保存最新价格
    PriceResponseDTO getLatestPrice(Long assetId);

    // 刷新价格
    PriceResponseDTO refreshPrice(Long assetId);

    // 查询历史价格
    List<PriceSnapshot> getHistoryPrices(HistoryPriceQueryDTO queryDTO);

}
