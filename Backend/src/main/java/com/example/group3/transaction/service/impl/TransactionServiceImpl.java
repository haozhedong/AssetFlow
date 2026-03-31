package com.example.group3.transaction.service.impl;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
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

    private final TransactionMapper transactionMapper;
    private final TransactionDomain transactionDomain; // DDD 领域

    @Override
    public List<TransactionVO> list(Long assetId) {
        List<Transaction> list;
        if (assetId != null) {
            list = transactionMapper.selectByAssetId(assetId);
        } else {
            list = transactionMapper.selectList(Wrappers.emptyWrapper());
        }

        return list.stream().map(e -> {
            TransactionVO vo = new TransactionVO();
            BeanUtils.copyProperties(e, vo);
            return vo;
        }).collect(Collectors.toList());
    }

    @Override
    public TransactionVO getById(Long id) {
        Transaction t = transactionMapper.selectById(id);
        TransactionVO vo = new TransactionVO();
        BeanUtils.copyProperties(t, vo);
        return vo;
    }

    @Override
    @Transactional
    public TransactionVO buy(TransactionDTO dto) {
        Transaction t = new Transaction();
        BeanUtils.copyProperties(dto, t);
        t.setTransactionType("buy");

        // TODO 调用接口，修改holding

        // DDD 领域规则校验
        transactionDomain.validateBuy(t);

        transactionMapper.insert(t);

        TransactionVO vo = new TransactionVO();
        BeanUtils.copyProperties(t, vo);
        return vo;
    }

    @Override
    @Transactional
    public TransactionVO sell(TransactionDTO dto) {
        Transaction t = new Transaction();
        BeanUtils.copyProperties(dto, t);
        t.setTransactionType("sell");
        // TODO 调用接口，修改holding

        // DDD 领域规则
        transactionDomain.validateSell(t);

        transactionMapper.insert(t);

        TransactionVO vo = new TransactionVO();
        BeanUtils.copyProperties(t, vo);
        return vo;
    }

    @Override
    @Transactional
    public void delete(Long id) {
        transactionMapper.deleteById(id);
    }
}
