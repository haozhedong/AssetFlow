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

    @GetMapping
    public List<AssetResponse> getAllAssets() {
        return assetService.getAllAssets();
    }

    @GetMapping("/{id}")
    public AssetResponse getAssetById(@PathVariable Long id) {
        return assetService.getAssetById(id);
    }

    @PostMapping
    public AssetResponse createAsset(@Valid @RequestBody CreateAssetRequest request) {
        return assetService.createAsset(request);
    }

    @PutMapping("/{id}")
    public AssetResponse updateAsset(@PathVariable Long id,
                                     @Valid @RequestBody UpdateAssetRequest request) {
        return assetService.updateAsset(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteAsset(@PathVariable Long id) {
        assetService.deleteAsset(id);
    }
}
