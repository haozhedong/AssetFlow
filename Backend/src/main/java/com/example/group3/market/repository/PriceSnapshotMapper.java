package com.example.group3.market.repository;

import com.example.group3.market.entity.PriceSnapshot;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface PriceSnapshotMapper {
    // 插入价格快照
    int insert(PriceSnapshot snapshot);

    // 根据资产ID + 日期范围查询历史价格
    List<PriceSnapshot> selectByAssetIdAndDateRange(
            Long assetId,
            String startDate,
            String endDate
    );

    // 获取最新价格
    PriceSnapshot selectLatestByAssetId(Long assetId);
}
