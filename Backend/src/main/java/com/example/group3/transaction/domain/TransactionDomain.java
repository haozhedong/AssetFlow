package com.example.group3.transaction.domain;

import com.example.group3.transaction.entity.Transaction;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

// DDD 领域服务：放业务规则、校验、领域行为
@Component
public class TransactionDomain {

    // 领域规则：买入数量必须 > 0
    public void validateBuy(Transaction transaction) {
        if (transaction.getQuantity().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("买入数量必须大于0");
        }
    }

    // 领域规则：卖出数量必须 > 0
    public void validateSell(Transaction transaction) {
        if (transaction.getQuantity().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("卖出数量必须大于0");
        }
    }
}
