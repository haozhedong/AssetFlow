package com.example.group3.market.service.impl;

import com.example.group3.market.dto.HistoryPriceQueryDTO;
import com.example.group3.market.dto.PriceResponseDTO;
import com.example.group3.market.entity.PriceSnapshot;
import com.example.group3.market.provider.FinnhubMarketDataProvider;
import com.example.group3.market.repository.PriceSnapshotMapper;
import com.example.group3.market.service.MarketService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MarketServiceImpl implements MarketService {

    private final FinnhubMarketDataProvider marketDataProvider;
    private final PriceSnapshotMapper priceSnapshotMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public PriceResponseDTO getLatestPrice(Long assetId) {
        // 1. 获取行情
        PriceResponseDTO dto = marketDataProvider.fetchPrice(assetId);

        // 2. 存入数据库
        PriceSnapshot snapshot = new PriceSnapshot();
        BeanUtils.copyProperties(dto, snapshot);
        priceSnapshotMapper.insert(snapshot);

        return dto;
    }

    @Override
    public PriceResponseDTO refreshPrice(Long assetId) {
        return getLatestPrice(assetId);
    }

    @Override
    public List<PriceSnapshot> getHistoryPrices(HistoryPriceQueryDTO queryDTO) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        return priceSnapshotMapper.selectByAssetIdAndDateRange(
                queryDTO.getAssetId(),
                queryDTO.getStartDate().format(formatter),
                queryDTO.getEndDate().format(formatter)
        );
    }
}
