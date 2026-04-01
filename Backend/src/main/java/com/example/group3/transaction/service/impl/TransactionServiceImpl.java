package com.example.group3.transaction.service.impl;

import com.example.group3.Asset.Entity.Asset;
import com.example.group3.Asset.Mapper.AssetMapper;
import com.example.group3.Holding.Service.HoldingService;
import com.example.group3.transaction.domain.TransactionDomain;
import com.example.group3.transaction.dto.TransactionDTO;
import com.example.group3.transaction.dto.TransactionVO;
import com.example.group3.transaction.repository.TransactionMapper;
import com.example.group3.transaction.service.TransactionService;
import com.example.group3.transaction.entity.Transaction;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransactionServiceImpl implements TransactionService {

    private final AssetMapper assetMapper;
    private final TransactionMapper transactionMapper;
    private final TransactionDomain transactionDomain; // DDD 领域
    private final HoldingService holdingService;

    @Override
    public List<TransactionVO> list(Long assetId) {
        List<Transaction> list;
        if (assetId != null) {
            list = transactionMapper.selectByAssetId(assetId);
        } else {
            list = transactionMapper.selectAll();
        }

        return list.stream().map(e -> {
            TransactionVO vo = new TransactionVO();
            BeanUtils.copyProperties(e, vo);
            Asset asset = assetMapper.findById(e.getAssetId());
            if (asset == null) {
                throw new RuntimeException("资产不存在，id=" + e.getAssetId());
            }
            vo.setSymbol(asset.getSymbol());
            return vo;
        }).collect(Collectors.toList());
    }

    @Override
    public TransactionVO getById(Long id) {
        Transaction t = transactionMapper.selectById(id);
        TransactionVO vo = new TransactionVO();
        BeanUtils.copyProperties(t, vo);
        Asset asset = assetMapper.findById(id);
        if (asset == null) {
            throw new RuntimeException("资产不存在，id=" + id);
        }
        t.setAssetId(asset.getId());
        return vo;
    }

    @Override
    @Transactional
    public TransactionVO buy(TransactionDTO dto) {
        Transaction t = new Transaction();
        Asset asset = assetMapper.findBySymbol(dto.getSymbol());
        if (asset == null) {
            throw new RuntimeException("资产不存在，symbol=" + dto.getSymbol());
        }
        BeanUtils.copyProperties(dto, t);
        t.setTransactionType("buy");
        t.setAssetId(asset.getId());

        holdingService.applyBuy(
                asset.getId(),
                dto.getQuantity(),
                dto.getPrice(),
                dto.getFee(),
                dto.getAccountName()
        );
        // DDD 领域规则校验
        transactionDomain.validateBuy(t);

        transactionMapper.insert(t);

        TransactionVO vo = new TransactionVO();
        BeanUtils.copyProperties(t, vo);
        vo.setSymbol(dto.getSymbol());
        return vo;
    }

    @Override
    @Transactional
    public TransactionVO sell(TransactionDTO dto) {
        Transaction t = new Transaction();
        Asset asset = assetMapper.findBySymbol(dto.getSymbol());
        if (asset == null) {
            throw new RuntimeException("资产不存在，symbol=" + dto.getSymbol());
        }
        BeanUtils.copyProperties(dto, t);
        t.setTransactionType("sell");
        t.setAssetId(asset.getId());

        holdingService.applySell(
                asset.getId(),
                dto.getQuantity(),
                dto.getPrice(),
                dto.getFee(),
                dto.getAccountName()
        );
        // DDD 领域规则
        transactionDomain.validateSell(t);

        transactionMapper.insert(t);

        TransactionVO vo = new TransactionVO();
        BeanUtils.copyProperties(t, vo);
        vo.setSymbol(dto.getSymbol());
        return vo;
    }

    @Override
    @Transactional
    public void delete(Long id) {
        transactionMapper.deleteById(id);
    }
}
