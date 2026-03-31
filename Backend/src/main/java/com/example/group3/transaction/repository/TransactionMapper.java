package com.example.group3.transaction.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import com.example.group3.transaction.entity.Transaction;

import java.util.List;

@Mapper
public interface TransactionMapper extends BaseMapper<Transaction> {
    // 自定义查询可写这里
    List<Transaction> selectByAssetId(Long assetId);
}
