package com.example.group3.Holding.Controller;

import com.example.group3.Holding.DTO.CreateHoldingRequest;
import com.example.group3.Holding.DTO.HoldingDetailResponse;
import com.example.group3.Holding.DTO.HoldingResponse;
import com.example.group3.Holding.DTO.UpdateHoldingRequest;
import com.example.group3.Holding.Service.HoldingService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/holdings")
public class HoldingController {
    private final HoldingService holdingService;

    public HoldingController(HoldingService holdingService) {
        this.holdingService = holdingService;
    }

    @GetMapping
    public List<HoldingResponse> getAllHoldings() {
        return holdingService.getAllHoldings();
    }

    @GetMapping("/{id}")
    public HoldingDetailResponse getDetailHoldingById(@PathVariable Long id) {
        return holdingService.getDetailHoldingById(id);
    }

    @PostMapping
    public HoldingResponse createHolding(@Valid @RequestBody CreateHoldingRequest request) {
        return holdingService.createHolding(request);
    }

    @PutMapping("/{id}")
    public HoldingResponse updateHolding(@PathVariable Long id,
                                         @Valid @RequestBody UpdateHoldingRequest request) {
        return holdingService.updateHolding(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteHolding(@PathVariable Long id) {
        holdingService.deleteHolding(id);
    }
}
