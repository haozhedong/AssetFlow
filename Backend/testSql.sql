USE assetflow_db;

INSERT INTO assets (symbol, name, asset_type, market, currency, sector, exchange, is_active)
VALUES ('AAPL', 'Apple Inc', 'STOCK', 'US', 'USD', 'Technology', 'NASDAQ', TRUE);

SELECT * FROM assets;

-- 2. test holdings
INSERT INTO holdings (asset_id, quantity, average_cost, cost_currency, purchase_date, account_name, notes)
VALUES (1, 10.0000, 150.0000, 'USD', '2026-03-30', 'Main Account', 'Test holding');

SELECT * FROM holdings;

-- 3. test transactions
INSERT INTO transactions (asset_id, transaction_type, quantity, price, fee, transaction_date, account_name, notes)
VALUES (1, 'BUY', 10.0000, 150.0000, 1.0000, '2026-03-30', 'Main Account', 'Initial buy');

SELECT * FROM transactions;

-- 4. test price snapshots
INSERT INTO price_snapshots (asset_id, snapshot_date, price, currency, source)
VALUES (1, '2026-03-30', 172.5000, 'USD', 'Manual Test');

SELECT * FROM price_snapshots;