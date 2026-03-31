package com.example.group3.transaction.repository;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import com.example.group3.transaction.entity.Transaction;

import java.util.List;

@Mapper
public interface TransactionMapper {
    List<Transaction> selectByAssetId(Long assetId);

    List<Transaction> selectAll();

    Transaction selectById(@Param("id") Long id);

    int insert(Transaction transaction);

    int deleteById(@Param("id") Long id);
}
