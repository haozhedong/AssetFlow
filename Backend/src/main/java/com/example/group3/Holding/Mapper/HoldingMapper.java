package com.example.group3.Holding.Mapper;

import org.apache.ibatis.annotations.Mapper;
import com.example.group3.Holding.Entity.Holding;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface HoldingMapper {
    List<Holding> findAll();

    Holding findById(@Param("id") Long id);

    Holding findByAssetId(@Param("assetId") Long assetId);

    int insert(Holding holding);

    int updateById(Holding holding);

    int deleteById(@Param("id") Long id);
}
