package com.example.group3.Asset.Mapper;

import com.example.group3.Asset.Entity.Asset;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface AssetMapper {
    List<Asset> findAll();

    Asset findById(@Param("id") Long id);

    Asset findBySymbol(@Param("symbol") String symbol);

    int insert(Asset asset);

    int updateById(Asset asset);

    int deleteById(@Param("id") Long id);
}
