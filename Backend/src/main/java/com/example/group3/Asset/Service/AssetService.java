package com.example.group3.Asset.Service;

import com.example.group3.Asset.DTO.AssetResponse;
import com.example.group3.Asset.DTO.CreateAssetRequest;
import com.example.group3.Asset.DTO.UpdateAssetRequest;

import java.util.List;

public interface AssetService {
    List<AssetResponse> getAllAssets();

    AssetResponse getAssetById(Long id);

    AssetResponse createAsset(CreateAssetRequest request);

    AssetResponse updateAsset(Long id, UpdateAssetRequest request);

    void deleteAsset(Long id);
}
