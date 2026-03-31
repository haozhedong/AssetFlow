package com.example.group3.transaction.controller;

import com.example.group3.transaction.dto.TransactionDTO;
import com.example.group3.transaction.dto.TransactionVO;
import com.example.group3.transaction.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @GetMapping
    public List<TransactionVO> list(@RequestParam(required = false) Long assetId) {
        return transactionService.list(assetId);
    }

    @GetMapping("/{id}")
    public TransactionVO getById(@PathVariable Long id) {
        return transactionService.getById(id);
    }

    @PostMapping("/buy")
    public TransactionVO buy(@RequestBody TransactionDTO dto) {
        return transactionService.buy(dto);
    }

    @PostMapping("/sell")
    public TransactionVO sell(@RequestBody TransactionDTO dto) {
        return transactionService.sell(dto);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        transactionService.delete(id);
    }
}
