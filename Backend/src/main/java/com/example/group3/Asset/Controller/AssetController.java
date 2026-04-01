package com.example.group3.Asset.Controller;

import com.example.group3.Asset.DTO.AssetResponse;
import com.example.group3.Asset.DTO.CreateAssetRequest;
import com.example.group3.Asset.DTO.UpdateAssetRequest;
import com.example.group3.Asset.Service.AssetService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assets")
public class AssetController {

    private final AssetService assetService;

    public AssetController(AssetService assetService) {
        this.assetService = assetService;
    }

    //获取全部资产列表
    @GetMapping
    public List<AssetResponse> getAllAssets() {
        return assetService.getAllAssets();
    }

    //根据ID获取对应资产
    @GetMapping("/{id}")
    public AssetResponse getAssetById(@PathVariable Long id) {
        return assetService.getAssetById(id);
    }

    //创建资产
    @PostMapping
    public AssetResponse createAsset(@Valid @RequestBody CreateAssetRequest request) {
        return assetService.createAsset(request);
    }

    //更新对应ID的资产
    @PutMapping("/{id}")
    public AssetResponse updateAsset(@PathVariable Long id,
                                     @Valid @RequestBody UpdateAssetRequest request) {
        return assetService.updateAsset(id, request);
    }

    //删除对应ID的资产
    @DeleteMapping("/{id}")
    public void deleteAsset(@PathVariable Long id) {
        assetService.deleteAsset(id);
    }
}
