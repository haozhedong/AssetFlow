package com.example.group3.market.service.impl;

import com.example.group3.market.dto.HistoryPriceQueryDTO;
import com.example.group3.market.dto.PriceResponseDTO;
import com.example.group3.market.entity.PriceSnapshot;
import com.example.group3.market.provider.MarketDataProvider;
import com.example.group3.market.repository.PriceSnapshotMapper;
import com.example.group3.market.service.MarketService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MarketServiceImpl implements MarketService {

    private final MarketDataProvider marketDataProvider;
    private final PriceSnapshotMapper priceSnapshotMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public PriceResponseDTO getLatestPrice(Long assetId, String symbol) {
        // 1. 从Provider获取最新行情
        PriceResponseDTO dto = marketDataProvider.getLatestPrice(assetId, symbol);

        // 2. 转成数据库实体并保存快照
        PriceSnapshot snapshot = new PriceSnapshot();
        BeanUtils.copyProperties(dto, snapshot);
        priceSnapshotMapper.insert(snapshot);

        return dto;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public PriceResponseDTO refreshPrice(Long assetId, String symbol) {
        return getLatestPrice(assetId, symbol);
    }

    @Override
    public void refreshAllPrices() {
        marketDataProvider.refreshAllPrices();
    }

    @Override
    public List<PriceSnapshot> getHistoryPrices(HistoryPriceQueryDTO queryDTO) {
        return priceSnapshotMapper.selectHistory(
                queryDTO.getAssetId(),
                queryDTO.getStartTime(),
                queryDTO.getEndTime()
        );
    }
}
