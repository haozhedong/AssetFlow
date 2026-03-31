package com.example.group3.market.repository;

import com.example.group3.market.entity.PriceSnapshot;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface PriceSnapshotMapper {
    int insert(PriceSnapshot snapshot);

    List<PriceSnapshot> selectHistory(
            @Param("assetId") Long assetId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );
}
