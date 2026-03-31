package com.example.group3.market.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
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
public class MarketServiceImpl extends ServiceImpl<PriceSnapshotMapper, PriceSnapshot> implements MarketService {

    private final MarketDataProvider marketDataProvider;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public PriceResponseDTO getLatestPrice(Long assetId, String symbol) {
        // 1. 从Provider获取最新行情
        PriceResponseDTO dto = marketDataProvider.getLatestPrice(assetId, symbol);

        // 2. 转成数据库实体并保存快照
        PriceSnapshot snapshot = new PriceSnapshot();
        BeanUtils.copyProperties(dto, snapshot);
        save(snapshot);

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
        LambdaQueryWrapper<PriceSnapshot> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(PriceSnapshot::getAssetId, queryDTO.getAssetId())
                .ge(PriceSnapshot::getSnapshotTime, queryDTO.getStartTime())
                .le(PriceSnapshot::getSnapshotTime, queryDTO.getEndTime())
                .orderByAsc(PriceSnapshot::getSnapshotTime);
        return list(wrapper);
    }
}
