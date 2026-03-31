package com.example.group3.market.service;

import com.example.group3.market.dto.HistoryPriceQueryDTO;
import com.example.group3.market.dto.PriceResponseDTO;
import com.example.group3.market.entity.PriceSnapshot;

import java.util.List;

public interface MarketService {
    // 获取最新价格并入库
    PriceResponseDTO getLatestPrice(Long assetId, String symbol);
    // 刷新单个资产价格
    PriceResponseDTO refreshPrice(Long assetId, String symbol);
    // 刷新所有资产
    void refreshAllPrices();
    // 查询历史价格
    List<PriceSnapshot> getHistoryPrices(HistoryPriceQueryDTO queryDTO);
}
