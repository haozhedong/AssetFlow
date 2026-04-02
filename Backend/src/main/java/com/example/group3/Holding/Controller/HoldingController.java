package com.example.group3.Holding.Controller;

import com.example.group3.Holding.DTO.*;
import com.example.group3.Holding.Service.HoldingService;
import com.example.group3.common.Response.PageResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/holdings")
public class HoldingController {
    private final HoldingService holdingService;

    public HoldingController(HoldingService holdingService) {
        this.holdingService = holdingService;
    }

    //获取全部持仓列表
    @GetMapping("/list")
    public List<HoldingDetailResponse> getAllHoldings() {
        return holdingService.getAllHoldings();
    }

    //可筛选，分页，排序的持仓列表
    @GetMapping
    public PageResponse<HoldingDetailResponse> getSelectAllHoldings(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String assetType,
            @RequestParam(required = false) String market,
            @RequestParam(required = false) String accountName,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir
    ) {
        HoldingQueryRequest request = new HoldingQueryRequest();
        request.setKeyword(keyword);
        request.setAssetType(assetType);
        request.setMarket(market);
        request.setAccountName(accountName);
        request.setPage(page);
        request.setPageSize(pageSize);
        request.setSortBy(sortBy);
        request.setSortDir(sortDir);

        return holdingService.getSelectAllHoldings(request);
    }

    //获取对应ID的Holding详情
    @GetMapping("/{id}")
    public HoldingDetailResponse getDetailHoldingById(@PathVariable Long id) {
        return holdingService.getDetailHoldingById(id);
    }

    //创建持仓
    @PostMapping
    public HoldingResponse createHolding(@Valid @RequestBody CreateHoldingRequest request) {
        return holdingService.createHolding(request);
    }

    //更新对应ID的持仓信息
    @PutMapping("/{id}")
    public HoldingDetailResponse updateHolding(@PathVariable Long id,
                                         @Valid @RequestBody UpdateHoldingRequest request) {
        return holdingService.updateHolding(id, request);
    }

    //删除对应ID的持仓
    @DeleteMapping("/{id}")
    public void deleteHolding(@PathVariable Long id) {
        holdingService.deleteHolding(id);
    }
}
