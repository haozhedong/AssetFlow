DROP DATABASE IF EXISTS assetflow_db;
CREATE DATABASE assetflow_db;
USE assetflow_db;

-- 1. assets
CREATE TABLE assets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    symbol VARCHAR(20),
    name VARCHAR(100),
    asset_type VARCHAR(50),
    market VARCHAR(50),
    currency VARCHAR(10),
    sector VARCHAR(100),
    exchange VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE
);

-- 2. holdings
CREATE TABLE holdings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    asset_id BIGINT,
    quantity DECIMAL(18,4),
    average_cost DECIMAL(18,4),
    cost_currency VARCHAR(10),
    purchase_date DATE,
    account_name VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (asset_id) REFERENCES assets(id)
);

-- 3. transactions
CREATE TABLE transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    asset_id BIGINT,
    transaction_type VARCHAR(20),
    quantity DECIMAL(18,4),
    price DECIMAL(18,4),
    fee DECIMAL(18,4),
    transaction_date DATE,
    account_name VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (asset_id) REFERENCES assets(id)
);

-- 4. price_snapshots
CREATE TABLE price_snapshots (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    asset_id BIGINT,
    snapshot_date DATE,
    price DECIMAL(18,4),
    currency VARCHAR(10),
    source VARCHAR(100),
    fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (asset_id) REFERENCES assets(id)
);

-- 5. portfolio_targets
CREATE TABLE portfolio_targets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    target_type VARCHAR(50),
    target_value DECIMAL(18,4),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 6. ai_insights
CREATE TABLE ai_insights (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    insight_type VARCHAR(50),
    content TEXT,
    related_scope VARCHAR(100),
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


