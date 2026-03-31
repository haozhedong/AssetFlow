package com.example.group3.market.controller;

import com.example.group3.market.dto.HistoryPriceQueryDTO;
import com.example.group3.market.dto.PriceResponseDTO;
import com.example.group3.market.entity.PriceSnapshot;
import com.example.group3.market.service.MarketService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/prices")
@RequiredArgsConstructor
public class MarketController {

    private final MarketService marketService;

    /**
     * 获取单个资产最新价格
     */
    @GetMapping("/latest/{assetId}")
    public PriceResponseDTO getLatestPrice(
            @PathVariable Long assetId,
            @RequestParam String symbol) {
        return marketService.getLatestPrice(assetId, symbol);
    }

    /**
     * 刷新单个资产价格
     */
    @PostMapping("/refresh/{assetId}")
    public PriceResponseDTO refreshPrice(
            @PathVariable Long assetId,
            @RequestParam String symbol) {
        return marketService.refreshPrice(assetId, symbol);
    }

    /**
     * 刷新所有资产价格
     */
    @PostMapping("/refresh-all")
    public void refreshAllPrices() {
        marketService.refreshAllPrices();
    }

    /**
     * 查询历史价格
     */
    @GetMapping("/history/{assetId}")
    public List<PriceSnapshot> getHistoryPrices(
            @PathVariable Long assetId,
            @RequestBody HistoryPriceQueryDTO queryDTO) {
        queryDTO.setAssetId(assetId);
        return marketService.getHistoryPrices(queryDTO);
    }
}
