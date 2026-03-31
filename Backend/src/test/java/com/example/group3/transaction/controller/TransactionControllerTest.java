package com.example.group3.transaction.controller;

import com.example.group3.transaction.dto.TransactionDTO;
import com.example.group3.transaction.dto.TransactionVO;
import com.example.group3.transaction.service.TransactionService;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.mockito.ArgumentCaptor;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.mockito.Mockito.mock;

class TransactionControllerTest {
    private final TransactionService transactionService = mock(TransactionService.class);
    private final TransactionController controller = new TransactionController(transactionService);

    @Test
    void list_shouldReturnVos_whenAssetIdProvided() throws Exception {
        Long assetId = 5L;
        TransactionVO vo = buildVO(1L, assetId, "buy", new BigDecimal("1.25"));
        when(transactionService.list(eq(assetId))).thenReturn(List.of(vo));

        List<TransactionVO> result = controller.list(assetId);
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo(1L);
        assertThat(result.get(0).getAssetId()).isEqualTo(assetId);
        assertThat(result.get(0).getTransactionType()).isEqualTo("buy");

        verify(transactionService, times(1)).list(eq(assetId));
    }

    @Test
    void list_shouldReturnVos_whenAssetIdNotProvided() throws Exception {
        TransactionVO vo = buildVO(2L, 1L, "sell", new BigDecimal("2"));
        when(transactionService.list(null)).thenReturn(List.of(vo));

        List<TransactionVO> result = controller.list(null);
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTransactionType()).isEqualTo("sell");

        verify(transactionService, times(1)).list(null);
    }

    @Test
    void getById_shouldReturnVo() throws Exception {
        Long id = 10L;
        TransactionVO vo = buildVO(id, 3L, "buy", new BigDecimal("0.5"));
        when(transactionService.getById(eq(id))).thenReturn(vo);

        TransactionVO result = controller.getById(id);
        assertThat(result.getId()).isEqualTo(id);
        assertThat(result.getAssetId()).isEqualTo(3L);

        verify(transactionService, times(1)).getById(eq(id));
    }

    @Test
    void buy_shouldDelegateToService_andReturnVo() throws Exception {
        TransactionDTO dto = buildDTO(20L, "ignored", new BigDecimal("3"));
        TransactionVO response = buildVO(1L, dto.getAssetId(), "buy", dto.getQuantity());
        when(transactionService.buy(any(TransactionDTO.class))).thenReturn(response);

        TransactionVO result = controller.buy(dto);
        assertThat(result.getTransactionType()).isEqualTo("buy");
        assertThat(result.getAssetId()).isEqualTo(dto.getAssetId());
        assertThat(result.getQuantity()).isEqualByComparingTo(dto.getQuantity());

        verify(transactionService, times(1)).buy(any(TransactionDTO.class));

        ArgumentCaptor<TransactionDTO> captor = ArgumentCaptor.forClass(TransactionDTO.class);
        verify(transactionService).buy(captor.capture());
        TransactionDTO called = captor.getValue();
        assertThat(called.getAssetId()).isEqualTo(dto.getAssetId());
        assertThat(called.getTransactionType()).isEqualTo(dto.getTransactionType());
        assertThat(called.getQuantity()).isEqualByComparingTo(dto.getQuantity());
    }

    @Test
    void sell_shouldDelegateToService_andReturnVo() throws Exception {
        TransactionDTO dto = buildDTO(30L, "ignored", new BigDecimal("5"));
        TransactionVO response = buildVO(1L, dto.getAssetId(), "sell", dto.getQuantity());
        when(transactionService.sell(any(TransactionDTO.class))).thenReturn(response);

        TransactionVO result = controller.sell(dto);
        assertThat(result.getTransactionType()).isEqualTo("sell");
        assertThat(result.getAssetId()).isEqualTo(dto.getAssetId());
        assertThat(result.getQuantity()).isEqualByComparingTo(dto.getQuantity());

        verify(transactionService, times(1)).sell(any(TransactionDTO.class));

        ArgumentCaptor<TransactionDTO> captor = ArgumentCaptor.forClass(TransactionDTO.class);
        verify(transactionService).sell(captor.capture());
        TransactionDTO called = captor.getValue();
        assertThat(called.getAssetId()).isEqualTo(dto.getAssetId());
        assertThat(called.getTransactionType()).isEqualTo(dto.getTransactionType());
        assertThat(called.getQuantity()).isEqualByComparingTo(dto.getQuantity());
    }

    @Test
    void delete_shouldDelegateToService() throws Exception {
        Long id = 777L;
        doNothing().when(transactionService).delete(eq(id));

        controller.delete(id);

        verify(transactionService, times(1)).delete(eq(id));
    }

    private static TransactionDTO buildDTO(Long assetId, String transactionType, BigDecimal quantity) {
        TransactionDTO dto = new TransactionDTO();
        dto.setAssetId(assetId);
        dto.setTransactionType(transactionType);
        dto.setQuantity(quantity);
        dto.setPrice(new BigDecimal("10"));
        dto.setFee(new BigDecimal("0.1"));
        dto.setTransactionDate(LocalDateTime.of(2026, 3, 30, 10, 20, 30));
        dto.setAccountName("cash");
        dto.setNotes("n/a");
        return dto;
    }

    private static TransactionVO buildVO(Long id, Long assetId, String transactionType, BigDecimal quantity) {
        TransactionVO vo = new TransactionVO();
        vo.setId(id);
        vo.setAssetId(assetId);
        vo.setTransactionType(transactionType);
        vo.setQuantity(quantity);
        vo.setPrice(new BigDecimal("10"));
        vo.setFee(new BigDecimal("0.1"));
        vo.setTransactionDate(LocalDateTime.of(2026, 3, 30, 10, 20, 30));
        vo.setAccountName("cash");
        vo.setNotes("n/a");
        vo.setCreatedAt(LocalDateTime.of(2026, 3, 30, 1, 2, 3));
        return vo;
    }
}

