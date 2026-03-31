package com.example.group3.transaction.service;

import com.example.group3.transaction.dto.TransactionDTO;
import com.example.group3.transaction.dto.TransactionVO;

import java.util.List;

public interface TransactionService {
    List<TransactionVO> list(Long assetId);
    TransactionVO getById(Long id);
    TransactionVO buy(TransactionDTO dto);
    TransactionVO sell(TransactionDTO dto);
    void delete(Long id);
}
