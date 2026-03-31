package com.example.group3.transaction.domain;

import com.example.group3.transaction.entity.Transaction;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThatNoException;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class TransactionDomainTest {

    private final TransactionDomain domain = new TransactionDomain();

    @Test
    void validateBuy_shouldPass_whenQuantityPositive() {
        Transaction t = new Transaction();
        t.setQuantity(new BigDecimal("0.01"));

        assertThatNoException().isThrownBy(() -> domain.validateBuy(t));
    }

    @Test
    void validateBuy_shouldThrow_whenQuantityZeroOrNegative() {
        Transaction t = new Transaction();
        t.setQuantity(BigDecimal.ZERO);

        assertThatThrownBy(() -> domain.validateBuy(t))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("买入数量必须大于0");
    }

    @Test
    void validateSell_shouldPass_whenQuantityPositive() {
        Transaction t = new Transaction();
        t.setQuantity(new BigDecimal("2"));

        assertThatNoException().isThrownBy(() -> domain.validateSell(t));
    }

    @Test
    void validateSell_shouldThrow_whenQuantityZeroOrNegative() {
        Transaction t = new Transaction();
        t.setQuantity(new BigDecimal("-1"));

        assertThatThrownBy(() -> domain.validateSell(t))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("卖出数量必须大于0");
    }
}

