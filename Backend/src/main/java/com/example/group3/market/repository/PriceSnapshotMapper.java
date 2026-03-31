package com.example.group3.market.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.group3.market.entity.PriceSnapshot;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface PriceSnapshotMapper extends BaseMapper<PriceSnapshot> {
}
