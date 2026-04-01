import { useEffect, useMemo, useState } from "react";
import {
  getAllHoldings,
  getHoldingById,
  createHolding,
  updateHolding,
  deleteHolding,
  exportHoldingsToCsv,
  getAllAssets,
  createAsset,
} from "../api/holdingsApi";

const emptyForm = {
  assetId: "",
  quantity: "",
  averageCost: "",
  costCurrency: "USD",
  purchaseDate: "",
  accountName: "",
  notes: "",
};

export default function Holdings() {
  const [holdings, setHoldings] = useState([]);
  const [availableAssets, setAvailableAssets] = useState([]);
  const [selectedHolding, setSelectedHolding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [showCreateAssetForm, setShowCreateAssetForm] = useState(false);
  const [creatingAsset, setCreatingAsset] = useState(false);
  const [formMode, setFormMode] = useState(""); // "", "add", "edit"
  const [formData, setFormData] = useState(emptyForm);
  const [assetSearch, setAssetSearch] = useState("");
  
  const [newAssetData, setNewAssetData] = useState({
    symbol: "",
    name: "",
    assetType: "STOCK",
    market: "",
  });

  const [filters, setFilters] = useState({
    assetType: "",
    market: "",
    accountName: "",
    keyword: "",
  });

  useEffect(() => {
    fetchHoldings();
    fetchAssets();
  }, []);

  async function fetchAssets() {
    try {
      const data = await getAllAssets();
      setAvailableAssets(data);
    } catch (err) {
      console.error("Failed to load assets:", err);
    }
  }

  async function fetchHoldings() {
    try {
      setLoading(true);
      setError("");
      const data = await getAllHoldings();
      setHoldings(data);

      if (data.length > 0) {
        await handleSelectHolding(data[0].id);
      } else {
        setSelectedHolding(null);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load holdings");
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectHolding(id) {
    try {
      setDetailLoading(true);
      setError("");
      const detail = await getHoldingById(id);
      setSelectedHolding(detail);
    } catch (err) {
      console.error(err);
      setError("Failed to load holding detail");
    } finally {
      setDetailLoading(false);
    }
  }

  function openAddForm() {
    setError("");
    setFormMode("add");
    setFormData(emptyForm);
    setAssetSearch("");
    setShowModal(true);
  }

  function openEditForm() {
    if (!selectedHolding) {
      setError("Please select one holding first");
      return;
    }

    setError("");
    setFormMode("edit");
    setFormData({
      assetId: selectedHolding.assetId ?? "",
      assetSymbol: selectedHolding.assetSymbol ?? "",
      quantity: selectedHolding.quantity ?? "",
      averageCost: selectedHolding.averageCost ?? "",
      costCurrency: selectedHolding.costCurrency ?? "USD",
      purchaseDate: selectedHolding.purchaseDate ?? "",
      accountName: selectedHolding.accountName ?? "",
      notes: selectedHolding.notes ?? "",
    });
    setAssetSearch(`${selectedHolding.assetSymbol} - ${selectedHolding.assetName}`);
    setShowModal(true);
  }

  function closeFormModal() {
    setShowModal(false);
    setFormMode("");
    setFormData(emptyForm);
    setAssetSearch("");
  }

  function closeForm() {
    closeFormModal();
  }

  async function handleCreateAsset() {
    try {
      if (!newAssetData.symbol.trim()) {
        setError("❌ Symbol is required");
        return;
      }
      if (!newAssetData.name.trim()) {
        setError("❌ Name is required");
        return;
      }

      setCreatingAsset(true);
      setError("");

      // 创建资产
      const newAsset = await createAsset({
        symbol: newAssetData.symbol.toUpperCase(),
        name: newAssetData.name,
        assetType: newAssetData.assetType || "STOCK",
        market: newAssetData.market || "",
        isActive: true,
      });

      // 刷新资产列表（失败了也继续）
      try {
        await fetchAssets();
      } catch (fetchErr) {
        console.warn("Asset list refresh failed:", fetchErr);
      }

      // 自动选择新创建的资产
      setFormData({
        ...formData,
        assetId: newAsset.id,
        assetSymbol: newAsset.symbol,
      });
      setAssetSearch(`${newAsset.symbol} - ${newAsset.name}`);

      // 关闭创建表单
      setShowCreateAssetForm(false);
      setNewAssetData({
        symbol: "",
        name: "",
        assetType: "STOCK",
        market: "",
      });
    } catch (err) {
      console.error("Asset creation error:", err);
      let errorMsg = "Failed to create asset";
      if (err.message && err.message.includes("Failed to fetch")) {
        errorMsg = "Network error - please check your connection";
      } else if (err.message) {
        errorMsg = err.message;
      }
      setError(`❌ ${errorMsg}`);
    } finally {
      setCreatingAsset(false);
    }
  }

  function handleFormChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmitForm(e) {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError("");

      const payload = {
        assetId: Number(formData.assetId),
        quantity: Number(formData.quantity),
        averageCost: Number(formData.averageCost),
        costCurrency: formData.costCurrency || "USD",
        purchaseDate: formData.purchaseDate || null,
        accountName: formData.accountName || "",
        notes: formData.notes || "",
      };

      if (!payload.assetId || payload.assetId <= 0) {
        throw new Error("❌ Asset: Please select from the dropdown list");
      }

      if (!payload.quantity || payload.quantity <= 0) {
        throw new Error("❌ Quantity: Must be greater than 0");
      }

      if (!payload.averageCost || payload.averageCost <= 0) {
        throw new Error("❌ Average Cost: Must be greater than 0");
      }

      let savedHolding;

      if (formMode === "add") {
        savedHolding = await createHolding(payload);
      } else if (formMode === "edit" && selectedHolding?.id) {
        savedHolding = await updateHolding(selectedHolding.id, payload);
      }

      await fetchHoldings();

      if (savedHolding?.id) {
        await handleSelectHolding(savedHolding.id);
      }

      closeFormModal();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to save holding");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!selectedHolding?.id) {
      setError("Please select one holding first");
      return;
    }

    const confirmed = window.confirm(`Delete holding #${selectedHolding.id}?`);
    if (!confirmed) return;

    try {
      setError("");
      await deleteHolding(selectedHolding.id);
      await fetchHoldings();
      setSelectedHolding(null);
      closeForm();
    } catch (err) {
      console.error(err);
      setError("Failed to delete holding");
    }
  }

  function handleExportCsv() {
    try {
      exportHoldingsToCsv(filteredHoldings);
    } catch (err) {
      console.error(err);
      setError("Failed to export CSV");
    }
  }

  const filteredAssets = useMemo(() => {
    if (!assetSearch) return availableAssets;
    const search = assetSearch.toLowerCase();
    return availableAssets.filter(
      (asset) =>
        (asset.symbol || "").toLowerCase().includes(search) ||
        (asset.name || "").toLowerCase().includes(search)
    );
  }, [availableAssets, assetSearch]);

  const filteredHoldings = useMemo(() => {
    return holdings.filter((item) => {
      const assetTypeMatch = filters.assetType
        ? String(item.assetType || "")
            .toLowerCase()
            .includes(filters.assetType.toLowerCase())
        : true;

      const marketMatch = filters.market
        ? String(item.market || "")
            .toLowerCase()
            .includes(filters.market.toLowerCase())
        : true;

      const accountMatch = filters.accountName
        ? String(item.accountName || "")
            .toLowerCase()
            .includes(filters.accountName.toLowerCase())
        : true;

      const keywordMatch = filters.keyword
        ? [
            item.id,
            item.assetId,
            item.assetSymbol,
            item.assetName,
            item.accountName,
            item.costCurrency,
            item.assetType,
            item.market,
            item.notes,
            item.purchaseDate,
          ]
            .join(" ")
            .toLowerCase()
            .includes(filters.keyword.toLowerCase())
        : true;

      return assetTypeMatch && marketMatch && accountMatch && keywordMatch;
    });
  }, [holdings, filters]);

  function formatNumber(value, digits = 2) {
    return Number(value ?? 0).toFixed(digits);
  }

  function formatDate(value) {
    return value || "-";
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>Holdings</div>

      {error ? <div style={styles.error}>{error}</div> : null}

      <div style={styles.layout}>
        <section style={styles.filterPanel}>
          <h3 style={styles.sectionTitle}>Filters</h3>

          <label style={styles.label}>asset_type</label>
          <input
            style={styles.input}
            value={filters.assetType}
            onChange={(e) =>
              setFilters({ ...filters, assetType: e.target.value })
            }
            placeholder="e.g., STOCK"
          />

          <label style={styles.label}>market</label>
          <input
            style={styles.input}
            value={filters.market}
            onChange={(e) =>
              setFilters({ ...filters, market: e.target.value })
            }
            placeholder="e.g., US"
          />

          <label style={styles.label}>account_name</label>
          <input
            style={styles.input}
            value={filters.accountName}
            onChange={(e) =>
              setFilters({ ...filters, accountName: e.target.value })
            }
            placeholder="e.g., Main Account"
          />

          <label style={styles.label}>keyword</label>
          <input
            style={styles.input}
            value={filters.keyword}
            onChange={(e) =>
              setFilters({ ...filters, keyword: e.target.value })
            }
            placeholder="Search all fields"
          />
        </section>

        <div style={styles.mainColumn}>
          <section style={styles.tableCard}>
            <h3 style={styles.sectionTitle}>Holding List</h3>

            {loading ? (
              <div style={styles.empty}>Loading holdings...</div>
            ) : (
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Symbol</th>
                      <th style={styles.th}>Asset Name</th>
                      <th style={styles.th}>Type</th>
                      <th style={styles.th}>Market</th>
                      <th style={styles.th}>Qty</th>
                      <th style={styles.th}>Avg Cost</th>
                      <th style={styles.th}>Latest Price</th>
                      <th style={styles.th}>Market Value</th>
                      <th style={styles.th}>Unrealized PnL</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredHoldings.map((item) => {
                      const isSelected = selectedHolding?.id === item.id;
                      const pnlColor =
                        Number(item.unrealizedPnl ?? 0) >= 0
                          ? "#22c55e"
                          : "#ef4444";

                      return (
                        <tr
                          key={item.id}
                          style={{
                            background: isSelected
                              ? "rgba(59,130,246,0.10)"
                              : "transparent",
                            cursor: "pointer",
                          }}
                          onClick={() => handleSelectHolding(item.id)}
                        >
                          <td style={{ ...styles.td, color: "#3b82f6", fontWeight: 600 }}>
                            {item.assetSymbol || "-"}
                          </td>
                          <td style={styles.td}>{item.assetName || "-"}</td>
                          <td style={styles.td}>{item.assetType || "-"}</td>
                          <td style={styles.td}>{item.market || "-"}</td>
                          <td style={styles.td}>{formatNumber(item.quantity, 4)}</td>
                          <td style={styles.td}>
                            ${formatNumber(item.averageCost, 4)}
                          </td>
                          <td style={styles.td}>
                            ${formatNumber(item.latestPrice, 4)}
                          </td>
                          <td style={styles.td}>
                            ${formatNumber(item.marketValue, 2)}
                          </td>
                          <td style={{ ...styles.td, color: pnlColor, fontWeight: 600 }}>
                            ${formatNumber(item.unrealizedPnl, 2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {!filteredHoldings.length && (
                  <div style={styles.empty}>No matching holdings</div>
                )}
              </div>
            )}
          </section>

          <div style={styles.bottomGrid}>
            <section style={styles.detailCard}>
              <h3 style={styles.sectionTitle}>Holding Detail</h3>

              {detailLoading ? (
                <div style={styles.empty}>Loading detail...</div>
              ) : selectedHolding ? (
                <div style={styles.detailList}>
                  <div style={styles.detailRow}>
                    <span style={styles.detailKey}>id</span>
                    <span>{selectedHolding.id}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailKey}>asset_id</span>
                    <span>{selectedHolding.assetId}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailKey}>asset_symbol</span>
                    <span style={{ color: "#3b82f6" }}>
                      {selectedHolding.assetSymbol || "-"}
                    </span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailKey}>asset_name</span>
                    <span>{selectedHolding.assetName || "-"}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailKey}>asset_type</span>
                    <span>{selectedHolding.assetType || "-"}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailKey}>market</span>
                    <span>{selectedHolding.market || "-"}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailKey}>quantity</span>
                    <span>{formatNumber(selectedHolding.quantity, 4)}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailKey}>average_cost</span>
                    <span>${formatNumber(selectedHolding.averageCost, 4)}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailKey}>latest_price</span>
                    <span>${formatNumber(selectedHolding.latestPrice, 4)}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailKey}>cost_currency</span>
                    <span>{selectedHolding.costCurrency || "-"}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailKey}>market_value</span>
                    <span>${formatNumber(selectedHolding.marketValue, 2)}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailKey}>unrealized_pnl</span>
                    <span
                      style={{
                        color:
                          Number(selectedHolding.unrealizedPnl ?? 0) >= 0
                            ? "#22c55e"
                            : "#ef4444",
                        fontWeight: 600,
                      }}
                    >
                      ${formatNumber(selectedHolding.unrealizedPnl, 2)}
                    </span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailKey}>pnl_percent</span>
                    <span
                      style={{
                        color:
                          Number(selectedHolding.pnlPercent ?? 0) >= 0
                            ? "#22c55e"
                            : "#ef4444",
                        fontWeight: 600,
                      }}
                    >
                      {formatNumber(selectedHolding.pnlPercent, 2)}%
                    </span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailKey}>purchase_date</span>
                    <span>{formatDate(selectedHolding.purchaseDate)}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailKey}>account_name</span>
                    <span>{selectedHolding.accountName || "-"}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailKey}>notes</span>
                    <span>{selectedHolding.notes || "-"}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailKey}>created_at</span>
                    <span>{formatDate(selectedHolding.createdAt)}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailKey}>updated_at</span>
                    <span>{formatDate(selectedHolding.updatedAt)}</span>
                  </div>
                </div>
              ) : (
                <div style={styles.empty}>Select one holding</div>
              )}
            </section>

            <section style={styles.actionCard}>
              <h3 style={styles.sectionTitle}>Actions</h3>

              <button 
                style={styles.primaryBtn} 
                onClick={() => openAddForm()}
                type="button"
              >
                Add Holding
              </button>
              <button 
                style={styles.secondaryBtn} 
                onClick={() => openEditForm()}
                type="button"
              >
                Edit Holding
              </button>
              <button 
                style={styles.secondaryBtn} 
                onClick={() => handleDelete()}
                type="button"
              >
                Delete Holding
              </button>
              <button 
                style={styles.secondaryBtn} 
                onClick={() => handleExportCsv()}
                type="button"
              >
                Export CSV
              </button>
            </section>
          </div>

          <section style={styles.formCard}>
            <h3 style={styles.sectionTitle}>
              {formMode === "add"
                ? "Add Holding"
                : formMode === "edit"
                ? "Edit Holding"
                : "Holding Form"}
            </h3>

            {formMode ? (
              <form onSubmit={handleSubmitForm} style={styles.form}>
                <div style={styles.formGrid}>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>asset_id</label>
                    <input
                      style={styles.input}
                      name="assetId"
                      value={formData.assetId}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>quantity</label>
                    <input
                      style={styles.input}
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>average_cost</label>
                    <input
                      style={styles.input}
                      name="averageCost"
                      value={formData.averageCost}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>cost_currency</label>
                    <input
                      style={styles.input}
                      name="costCurrency"
                      value={formData.costCurrency}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>purchase_date</label>
                    <input
                      style={styles.input}
                      type="date"
                      name="purchaseDate"
                      value={formData.purchaseDate}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>account_name</label>
                    <input
                      style={styles.input}
                      name="accountName"
                      value={formData.accountName}
                      onChange={handleFormChange}
                    />
                  </div>
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>notes</label>
                  <textarea
                    style={styles.textarea}
                    name="notes"
                    value={formData.notes}
                    onChange={handleFormChange}
                  />
                </div>

                <div style={styles.formActions}>
                  <button
                    type="submit"
                    style={styles.primaryBtn}
                    disabled={submitting}
                  >
                    {submitting ? "Saving..." : "Save"}
                  </button>

                  <button
                    type="button"
                    style={styles.secondaryBtn}
                    onClick={closeForm}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div style={styles.empty}>Click Add Holding or Edit Holding</div>
            )}
          </section>

          {showModal && (
            <div style={styles.modalOverlay} onClick={closeForm}>
              <div
                style={styles.modalContent}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={styles.modalHeader}>
                  <h3 style={styles.modalTitle}>
                    {formMode === "add"
                      ? "Add Holding"
                      : formMode === "edit"
                      ? "Edit Holding"
                      : "Holding Form"}
                  </h3>
                  <button
                    type="button"
                    style={styles.modalCloseBtn}
                    onClick={closeForm}
                  >
                    ✕
                  </button>
                </div>

                {error && (
                  <div
                    style={{
                      background: "#7f1d1d",
                      border: "1px solid #dc2626",
                      borderRadius: "10px",
                      padding: "12px",
                      color: "#fca5a5",
                      fontSize: "13px",
                      marginBottom: "16px",
                    }}
                  >
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmitForm} style={styles.modalForm}>
                  <div style={styles.formGrid}>
                    <div style={styles.fieldGroup}>
                      <label style={styles.label}>
                        Asset <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <div style={styles.assetSelector}>
                        <input
                          type="text"
                          style={styles.input}
                          placeholder="Search by Symbol or Name..."
                          value={assetSearch}
                          onChange={(e) => setAssetSearch(e.target.value)}
                          autoComplete="off"
                        />
                        {assetSearch && 
                         !(formData.assetSymbol && assetSearch.includes(formData.assetSymbol)) && (
                          <div style={styles.dropdown}>
                            {filteredAssets.length > 0 ? (
                              filteredAssets.map((asset) => (
                                <div
                                  key={asset.id}
                                  style={styles.dropdownItem}
                                  onClick={() => {
                                    setFormData({
                                      ...formData,
                                      assetId: asset.id,
                                      assetSymbol: asset.symbol,
                                    });
                                    setAssetSearch(
                                      `${asset.symbol} - ${asset.name}`
                                    );
                                  }}
                                >
                                  <strong>{asset.symbol}</strong> - {asset.name}
                                </div>
                              ))
                            ) : (
                              <div>
                                <div
                                  style={{
                                    padding: "10px 12px",
                                    color: "#94a3b8",
                                    fontSize: "13px",
                                    borderBottom: "1px solid #273449",
                                  }}
                                >
                                  No matching assets
                                </div>
                                <div
                                  style={styles.createAssetOption}
                                  onClick={() => {
                                    setNewAssetData({
                                      symbol: assetSearch
                                        .split(" ")[0]
                                        .toUpperCase(),
                                      name: assetSearch,
                                      assetType: "STOCK",
                                      market: "",
                                    });
                                    setShowCreateAssetForm(true);
                                  }}
                                >
                                  ➕ Create "{assetSearch}"
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      {formData.assetId && formData.assetSymbol && (
                        <div style={styles.selectedAsset}>
                          ✓ Selected: {formData.assetSymbol}
                        </div>
                      )}
                      {!formData.assetId && assetSearch && (
                        <div
                          style={{
                            marginTop: "8px",
                            fontSize: "12px",
                            color: "#ef4444",
                          }}
                        >
                          Please select an asset from the list or create a new one
                        </div>
                      )}
                    </div>

                    <div style={styles.fieldGroup}>
                      <label style={styles.label}>
                        quantity <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <input
                        style={styles.input}
                        type="number"
                        step="0.0001"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleFormChange}
                        placeholder="e.g., 10"
                      />
                    </div>

                    <div style={styles.fieldGroup}>
                      <label style={styles.label}>
                        average_cost <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <input
                        style={styles.input}
                        type="number"
                        step="0.0001"
                        name="averageCost"
                        value={formData.averageCost}
                        onChange={handleFormChange}
                        placeholder="e.g., 150.50"
                      />
                    </div>

                    <div style={styles.fieldGroup}>
                      <label style={styles.label}>cost_currency</label>
                      <input
                        style={styles.input}
                        name="costCurrency"
                        value={formData.costCurrency}
                        onChange={handleFormChange}
                        placeholder="USD"
                      />
                    </div>

                    <div style={styles.fieldGroup}>
                      <label style={styles.label}>purchase_date</label>
                      <input
                        style={styles.input}
                        type="date"
                        name="purchaseDate"
                        value={formData.purchaseDate}
                        onChange={handleFormChange}
                      />
                    </div>

                    <div style={styles.fieldGroup}>
                      <label style={styles.label}>account_name</label>
                      <input
                        style={styles.input}
                        name="accountName"
                        value={formData.accountName}
                        onChange={handleFormChange}
                        placeholder="Main Account"
                      />
                    </div>
                  </div>

                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>notes</label>
                    <textarea
                      style={styles.textarea}
                      name="notes"
                      value={formData.notes}
                      onChange={handleFormChange}
                      placeholder="Add any notes..."
                    />
                  </div>

                  <div style={styles.modalActions}>
                    <button
                      type="submit"
                      style={styles.primaryBtn}
                      disabled={submitting}
                    >
                      {submitting ? "Saving..." : "Save"}
                    </button>
                    <button
                      type="button"
                      style={styles.secondaryBtn}
                      onClick={closeForm}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {showCreateAssetForm && (
            <div style={styles.modalOverlay} onClick={() => setShowCreateAssetForm(false)}>
              <div
                style={styles.modalContent}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={styles.modalHeader}>
                  <h3 style={styles.modalTitle}>Create New Asset</h3>
                  <button
                    type="button"
                    style={styles.modalCloseBtn}
                    onClick={() => setShowCreateAssetForm(false)}
                  >
                    ✕
                  </button>
                </div>

                {error && (
                  <div
                    style={{
                      background: "#7f1d1d",
                      border: "1px solid #dc2626",
                      borderRadius: "10px",
                      padding: "12px",
                      color: "#fca5a5",
                      fontSize: "13px",
                      marginBottom: "16px",
                    }}
                  >
                    {error}
                  </div>
                )}

                <div style={styles.modalForm}>
                  <div style={styles.formGrid}>
                    <div style={styles.fieldGroup}>
                      <label style={styles.label}>
                        Symbol <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <input
                        style={styles.input}
                        type="text"
                        value={newAssetData.symbol}
                        onChange={(e) =>
                          setNewAssetData({
                            ...newAssetData,
                            symbol: e.target.value.toUpperCase(),
                          })
                        }
                        placeholder="e.g., AAPL"
                      />
                    </div>

                    <div style={styles.fieldGroup}>
                      <label style={styles.label}>
                        Name <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <input
                        style={styles.input}
                        type="text"
                        value={newAssetData.name}
                        onChange={(e) =>
                          setNewAssetData({
                            ...newAssetData,
                            name: e.target.value,
                          })
                        }
                        placeholder="e.g., Apple Inc."
                      />
                    </div>

                    <div style={styles.fieldGroup}>
                      <label style={styles.label}>
                        Asset Type <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <input
                        style={styles.input}
                        type="text"
                        value={newAssetData.assetType}
                        onChange={(e) =>
                          setNewAssetData({
                            ...newAssetData,
                            assetType: e.target.value,
                          })
                        }
                        placeholder="e.g., STOCK"
                      />
                    </div>

                    <div style={styles.fieldGroup}>
                      <label style={styles.label}>Market</label>
                      <input
                        style={styles.input}
                        type="text"
                        value={newAssetData.market}
                        onChange={(e) =>
                          setNewAssetData({
                            ...newAssetData,
                            market: e.target.value,
                          })
                        }
                        placeholder="e.g., US"
                      />
                    </div>
                  </div>

                  <div style={styles.modalActions}>
                    <button
                      type="button"
                      style={styles.primaryBtn}
                      disabled={creatingAsset}
                      onClick={handleCreateAsset}
                    >
                      {creatingAsset ? "Creating..." : "Create Asset"}
                    </button>
                    <button
                      type="button"
                      style={styles.secondaryBtn}
                      onClick={() => setShowCreateAssetForm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    position: "relative",
  },

  header: {
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "16px",
    padding: "18px 22px",
    color: "#e2e8f0",
    fontSize: "28px",
    fontWeight: 700,
  },

  error: {
    color: "#ef4444",
    fontSize: "14px",
  },

  layout: {
    display: "grid",
    gridTemplateColumns: "240px 1fr",
    gap: "20px",
  },

  filterPanel: {
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "20px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    minHeight: "auto",
    maxHeight: "500px",
    overflowY: "auto",
  },

  sectionTitle: {
    margin: 0,
    marginBottom: "10px",
    color: "#e2e8f0",
    fontSize: "18px",
    fontWeight: 700,
  },

  label: {
    fontSize: "13px",
    color: "#94a3b8",
    marginTop: "8px",
  },

  input: {
    background: "#0f172a",
    border: "1px solid #334155",
    borderRadius: "12px",
    padding: "10px 12px",
    color: "#e2e8f0",
    outline: "none",
  },

  textarea: {
    background: "#0f172a",
    border: "1px solid #334155",
    borderRadius: "12px",
    padding: "10px 12px",
    color: "#e2e8f0",
    outline: "none",
    minHeight: "100px",
    resize: "vertical",
  },

  mainColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  tableCard: {
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "20px",
    padding: "20px",
  },

  tableWrapper: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    textAlign: "left",
    padding: "14px",
    fontSize: "13px",
    color: "#94a3b8",
    borderBottom: "1px solid #334155",
    fontWeight: 500,
  },

  td: {
    padding: "14px",
    borderBottom: "1px solid #273449",
    color: "#e2e8f0",
    fontSize: "14px",
  },

  bottomGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
  },

  detailCard: {
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "20px",
    padding: "20px",
    minHeight: "250px",
    maxHeight: "600px",
    overflowY: "auto",
  },

  actionCard: {
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "20px",
    padding: "20px",
    minHeight: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    zIndex: 10,
  },

  formCard: {
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "20px",
    padding: "20px",
  },

  detailList: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },

  detailRow: {
    display: "grid",
    gridTemplateColumns: "160px 1fr",
    color: "#e2e8f0",
    fontSize: "14px",
  },

  detailKey: {
    color: "#94a3b8",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },

  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },

  formActions: {
    display: "flex",
    gap: "12px",
    marginTop: "8px",
  },

  primaryBtn: {
    background: "#3b82f6",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    padding: "12px 16px",
    fontSize: "14px",
    cursor: "pointer",
    fontWeight: 600,
    transition: "all 0.2s ease",
    width: "100%",
    textAlign: "center",
  },

  secondaryBtn: {
    background: "#0f172a",
    color: "#e2e8f0",
    border: "1px solid #334155",
    borderRadius: "12px",
    padding: "12px 16px",
    fontSize: "14px",
    cursor: "pointer",
    fontWeight: 600,
    transition: "all 0.2s ease",
    width: "100%",
    textAlign: "center",
  },

  empty: {
    color: "#94a3b8",
    fontSize: "14px",
  },

  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },

  modalContent: {
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "20px",
    padding: "24px",
    maxWidth: "500px",
    width: "90%",
    maxHeight: "85vh",
    overflowY: "auto",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.8)",
  },

  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },

  modalTitle: {
    margin: 0,
    color: "#e2e8f0",
    fontSize: "20px",
    fontWeight: 700,
  },

  modalCloseBtn: {
    background: "transparent",
    border: "none",
    color: "#94a3b8",
    fontSize: "24px",
    cursor: "pointer",
    padding: "0",
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "color 0.2s ease",
  },

  modalForm: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },

  modalActions: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginTop: "20px",
  },

  assetSelector: {
    position: "relative",
  },

  dropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    background: "#0f172a",
    border: "1px solid #334155",
    borderRadius: "12px",
    marginTop: "4px",
    zIndex: 10,
    maxHeight: "200px",
    overflowY: "auto",
  },

  dropdownItem: {
    padding: "10px 12px",
    color: "#e2e8f0",
    cursor: "pointer",
    borderBottom: "1px solid #273449",
    transition: "background 0.2s ease",
  },

  createAssetOption: {
    padding: "10px 12px",
    color: "#3b82f6",
    cursor: "pointer",
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    fontWeight: 600,
    fontSize: "14px",
    transition: "all 0.2s ease",
  },

  selectedAsset: {
    marginTop: "8px",
    fontSize: "13px",
    color: "#3b82f6",
    fontWeight: 500,
  },
};