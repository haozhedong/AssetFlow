package com.example.group3.Asset.Service.impl;

import com.example.group3.Asset.DTO.AssetResponse;
import com.example.group3.Asset.DTO.CreateAssetRequest;
import com.example.group3.Asset.DTO.UpdateAssetRequest;
import com.example.group3.Asset.Entity.Asset;
import com.example.group3.Asset.Mapper.AssetMapper;
import com.example.group3.Asset.Service.AssetService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AssetServiceImpl implements AssetService {

    private final AssetMapper assetMapper;

    public AssetServiceImpl(AssetMapper assetMapper) {
        this.assetMapper = assetMapper;
    }

    @Override
    public List<AssetResponse> getAllAssets() {
        List<Asset> assets = assetMapper.findAll();
        return assets.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public AssetResponse getAssetById(Long id) {
        Asset asset = assetMapper.findById(id);
        if (asset == null) {
            throw new RuntimeException("Asset not found, id = " + id);
        }
        return toResponse(asset);
    }

    @Override
    public AssetResponse createAsset(CreateAssetRequest request) {
        Asset asset = new Asset();
        asset.setSymbol(request.getSymbol());
        asset.setName(request.getName());
        asset.setAssetType(request.getAssetType());
        asset.setMarket(request.getMarket());
        asset.setCurrency(request.getCurrency());
        asset.setSector(request.getSector());
        asset.setExchange(request.getExchange());
        asset.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);

        assetMapper.insert(asset);
        return toResponse(asset);
    }

    @Override
    public AssetResponse updateAsset(Long id, UpdateAssetRequest request) {
        Asset existingAsset = assetMapper.findById(id);
        if (existingAsset == null) {
            throw new RuntimeException("Asset not found, id = " + id);
        }

        existingAsset.setSymbol(request.getSymbol());
        existingAsset.setName(request.getName());
        existingAsset.setAssetType(request.getAssetType());
        existingAsset.setMarket(request.getMarket());
        existingAsset.setCurrency(request.getCurrency());
        existingAsset.setSector(request.getSector());
        existingAsset.setExchange(request.getExchange());
        existingAsset.setIsActive(request.getIsActive());

        assetMapper.updateById(existingAsset);
        return toResponse(existingAsset);
    }

    @Override
    public void deleteAsset(Long id) {
        Asset existingAsset = assetMapper.findById(id);
        if (existingAsset == null) {
            throw new RuntimeException("Asset not found, id = " + id);
        }
        assetMapper.deleteById(id);
    }

    private AssetResponse toResponse(Asset asset) {
        AssetResponse response = new AssetResponse();
        response.setId(asset.getId());
        response.setSymbol(asset.getSymbol());
        response.setName(asset.getName());
        response.setAssetType(asset.getAssetType());
        response.setMarket(asset.getMarket());
        response.setCurrency(asset.getCurrency());
        response.setSector(asset.getSector());
        response.setExchange(asset.getExchange());
        response.setIsActive(asset.getIsActive());
        return response;
    }
}
