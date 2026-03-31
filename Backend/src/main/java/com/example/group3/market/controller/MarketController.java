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

    // 获取最新价格
    @GetMapping("/latest/{assetId}")
    public PriceResponseDTO getLatestPrice(@PathVariable Long assetId) {
        return marketService.getLatestPrice(assetId);
    }

    // 刷新价格
    @PostMapping("/refresh/{assetId}")
    public PriceResponseDTO refreshPrice(@PathVariable Long assetId) {
        return marketService.refreshPrice(assetId);
    }

    // 查询历史价格
    @GetMapping("/history/{assetId}")
    public List<PriceSnapshot> getHistoryPrices(
            @PathVariable Long assetId,
            @RequestBody HistoryPriceQueryDTO queryDTO) {
        queryDTO.setAssetId(assetId);
        return marketService.getHistoryPrices(queryDTO);
    }
}
