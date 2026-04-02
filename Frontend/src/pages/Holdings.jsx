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

const emptyNewAsset = {
  symbol: "",
  name: "",
  assetType: "STOCK",
  market: "",
};

export default function Holdings() {
  const [holdings, setHoldings] = useState([]);
  const [availableAssets, setAvailableAssets] = useState([]);
  const [selectedHolding, setSelectedHolding] = useState(null);

  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [creatingAsset, setCreatingAsset] = useState(false);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [showCreateAssetForm, setShowCreateAssetForm] = useState(false);

  const [formMode, setFormMode] = useState(""); // "", "add", "edit"
  const [formData, setFormData] = useState(emptyForm);
  const [assetSearch, setAssetSearch] = useState("");
  const [newAssetData, setNewAssetData] = useState(emptyNewAsset);



  const [filters, setFilters] = useState({
    assetType: "",
    market: "",
    accountName: "",
    keyword: "",
  });

  useEffect(() => {
    fetchAssets();
    fetchHoldings();
  }, []);

  async function fetchAssets() {
    try {
      const data = await getAllAssets();
      setAvailableAssets(data || []);
    } catch (err) {
      console.error("Failed to load assets:", err);
    }
  }

  async function fetchHoldings() {
    try {
      setLoading(true);
      setError("");
      const data = await getAllHoldings();
      setHoldings(data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load holdings");
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectHolding(id) {
    if (!id) return;

    if (selectedHolding?.id === id) {
      setSelectedHolding(null);
      return;
    }

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

  function openEditForm(holding) {
    if (!holding) {
      setError("Please select one holding first");
      return;
    }

    setError("");
    setFormMode("edit");
    setFormData({
      assetId: holding.assetId ?? "",
      assetSymbol: holding.assetSymbol ?? "",
      quantity: holding.quantity ?? "",
      averageCost: holding.averageCost ?? "",
      costCurrency: holding.costCurrency ?? "USD",
      purchaseDate: holding.purchaseDate ?? "",
      accountName: holding.accountName ?? "",
      notes: holding.notes ?? "",
    });
    setAssetSearch(
      holding.assetSymbol
        ? `${holding.assetSymbol} - ${holding.assetName || ""}`
        : ""
    );
    setSelectedHolding(holding);
    setShowModal(true);
  }

  function closeFormModal() {
    setShowModal(false);
    setFormMode("");
    setFormData(emptyForm);
    setAssetSearch("");
  }

  async function handleCreateAsset() {
    try {
      const normalizedSymbol = newAssetData.symbol.trim().toUpperCase();

      if (!normalizedSymbol) {
        setError("Symbol is required");
        return;
      }

      if (!newAssetData.name.trim()) {
        setError("Name is required");
        return;
      }

      const existingAsset = availableAssets.find(
          (asset) => String(asset.symbol || "").trim().toUpperCase() === normalizedSymbol
      );

      if (existingAsset) {
        setError(`Asset ${normalizedSymbol} already exists`);

        setFormData((prev) => ({
          ...prev,
          assetId: existingAsset.id,
          assetSymbol: existingAsset.symbol,
        }));
        setAssetSearch(`${existingAsset.symbol} - ${existingAsset.name || ""}`);
        setShowCreateAssetForm(false);
        return;
      }

      setCreatingAsset(true);
      setError("");

      const newAsset = await createAsset({
        symbol: normalizedSymbol,
        name: newAssetData.name.trim(),
        assetType: newAssetData.assetType || "STOCK",
        market: newAssetData.market || "",
        isActive: true,
      });

      await fetchAssets();

      setFormData((prev) => ({
        ...prev,
        assetId: newAsset.id,
        assetSymbol: newAsset.symbol,
      }));
      setAssetSearch(`${newAsset.symbol} - ${newAsset.name}`);

      setShowCreateAssetForm(false);
      setNewAssetData(emptyNewAsset);
    } catch (err) {
      console.error("Asset creation error:", err);
      setError(err.message || "Failed to create asset");
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
    if (e && e.preventDefault) e.preventDefault();

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
        throw new Error("Please select an asset from the list");
      }

      if (!payload.quantity || payload.quantity <= 0) {
        throw new Error("Quantity must be greater than 0");
      }

      if (!payload.averageCost || payload.averageCost <= 0) {
        throw new Error("Average cost must be greater than 0");
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

  async function handleDelete(holding) {
    if (!holding?.id) {
      setError("Please select one holding first");
      return;
    }

    const confirmed = window.confirm(
      `Delete ${holding.assetSymbol || "this holding"}?`
    );
    if (!confirmed) return;

    try {
      setError("");
      await deleteHolding(holding.id);
      if (selectedHolding?.id === holding.id) {
        setSelectedHolding(null);
      }
      await fetchHoldings();
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

  function formatQuantity(value) {
    return Math.round(Number(value ?? 0)).toLocaleString();
  }

  function formatMoney(value, digits = 2) {
    return `$${Number(value ?? 0).toLocaleString(undefined, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    })}`;
  }

  function formatDate(value) {
    return value || "-";
  }

  return (
    <div style={styles.page}>
      <section style={styles.hero}>
        <div>
          <div style={styles.overline}>HOLDINGS</div>
          <h1 style={styles.pageTitle}>Portfolio Holdings</h1>
          <p style={styles.pageSubtitle}>
            Monitor, edit, export, and inspect each position in a terminal-style
            layout.
          </p>
        </div>

        <div style={styles.heroActions}>
          <button style={styles.primaryBtn} type="button" onClick={openAddForm}>
            + Add Holding
          </button>
          <button
            style={styles.secondaryBtnCompact}
            type="button"
            onClick={handleExportCsv}
          >
            Export CSV
          </button>
        </div>
      </section>

      {error ? <div style={styles.error}>{error}</div> : null}

      <section style={styles.filtersSection}>
        <div style={styles.sectionBar}>
          <h2 style={styles.sectionTitle}>Filters</h2>
        </div>

        <div style={styles.filtersGrid}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Asset Type</label>
            <input
              style={styles.input}
              value={filters.assetType}
              onChange={(e) =>
                setFilters({ ...filters, assetType: e.target.value })
              }
              placeholder="e.g. STOCK"
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Market</label>
            <input
              style={styles.input}
              value={filters.market}
              onChange={(e) =>
                setFilters({ ...filters, market: e.target.value })
              }
              placeholder="e.g. US"
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Account</label>
            <input
              style={styles.input}
              value={filters.accountName}
              onChange={(e) =>
                setFilters({ ...filters, accountName: e.target.value })
              }
              placeholder="e.g. Main Account"
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Keyword</label>
            <input
              style={styles.input}
              value={filters.keyword}
              onChange={(e) =>
                setFilters({ ...filters, keyword: e.target.value })
              }
              placeholder="Search symbol, name, notes..."
            />
          </div>
        </div>
      </section>

      <section style={styles.tableSection}>
        <div style={styles.sectionBar}>
          <h2 style={styles.sectionTitle}>Holding List</h2>
          <span style={styles.sectionMeta}>
            {filteredHoldings.length} position
            {filteredHoldings.length === 1 ? "" : "s"}
          </span>
        </div>

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
                  <th style={styles.th}>PnL</th>
                  <th style={styles.thActions}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredHoldings.map((item) => {
                  const isSelected = selectedHolding?.id === item.id;
                  const pnlColor =
                    Number(item.unrealizedPnl ?? 0) >= 0 ? "#22c55e" : "#ef4444";

                  return (
                    <>
                      <tr
                        key={`row-${item.id}`}
                        style={{
                          ...styles.tableRow,
                          background: isSelected
                            ? "rgba(59,130,246,0.08)"
                            : "transparent",
                        }}
                      >
                        <td
                          style={{ ...styles.tdSymbol, cursor: "pointer" }}
                          onClick={() => handleSelectHolding(item.id)}
                        >
                          {item.assetSymbol || "-"}
                        </td>
                        <td
                          style={{ ...styles.td, cursor: "pointer" }}
                          onClick={() => handleSelectHolding(item.id)}
                        >
                          {item.assetName || "-"}
                        </td>
                        <td
                          style={{ ...styles.td, cursor: "pointer" }}
                          onClick={() => handleSelectHolding(item.id)}
                        >
                          {item.assetType || "-"}
                        </td>
                        <td
                          style={{ ...styles.td, cursor: "pointer" }}
                          onClick={() => handleSelectHolding(item.id)}
                        >
                          {item.market || "-"}
                        </td>
                        <td
                          style={{ ...styles.td, cursor: "pointer" }}
                          onClick={() => handleSelectHolding(item.id)}
                        >
                          {formatQuantity(item.quantity)}
                        </td>
                        <td
                          style={{ ...styles.td, cursor: "pointer" }}
                          onClick={() => handleSelectHolding(item.id)}
                        >
                          {formatMoney(item.averageCost)}
                        </td>
                        <td
                          style={{ ...styles.td, cursor: "pointer" }}
                          onClick={() => handleSelectHolding(item.id)}
                        >
                          {formatMoney(item.latestPrice)}
                        </td>
                        <td
                          style={{ ...styles.td, cursor: "pointer" }}
                          onClick={() => handleSelectHolding(item.id)}
                        >
                          {formatMoney(item.marketValue)}
                        </td>
                        <td
                          style={{
                            ...styles.td,
                            color: pnlColor,
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                          onClick={() => handleSelectHolding(item.id)}
                        >
                          {formatMoney(item.unrealizedPnl)}
                        </td>
                        <td style={styles.tdActions}>
                          <button
                            type="button"
                            style={styles.rowGhostBtn}
                            onClick={() => openEditForm(item)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            style={styles.rowDangerBtn}
                            onClick={() => handleDelete(item)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>

                      {isSelected && (
                        <tr key={`detail-${item.id}`}>
                          <td colSpan={10} style={styles.detailCell}>
                            {detailLoading ? (
                              <div style={styles.detailLoading}>
                                Loading details...
                              </div>
                            ) : (
                              <div style={styles.detailPanel}>
                                <div style={styles.detailHeader}>
                                  <div>
                                    <div style={styles.detailTitle}>
                                      {selectedHolding?.assetSymbol || "-"} ·{" "}
                                      {selectedHolding?.assetName || "-"}
                                    </div>
                                    <div style={styles.detailSubtitle}>
                                      Click the same row again to collapse.
                                    </div>
                                  </div>

                                  <div style={styles.detailHeaderStats}>
                                    <span style={styles.detailStat}>
                                      MV {formatMoney(selectedHolding?.marketValue)}
                                    </span>
                                    <span
                                      style={{
                                        ...styles.detailStat,
                                        color:
                                          Number(
                                            selectedHolding?.unrealizedPnl ?? 0
                                          ) >= 0
                                            ? "#22c55e"
                                            : "#ef4444",
                                      }}
                                    >
                                      PnL {formatMoney(selectedHolding?.unrealizedPnl)}
                                    </span>
                                  </div>
                                </div>

                                <div style={styles.detailGrid}>
                                  <div style={styles.detailItem}>
                                    <span style={styles.detailKey}>Holding ID</span>
                                    <span style={styles.detailValue}>
                                      {selectedHolding?.id ?? "-"}
                                    </span>
                                  </div>
                                  <div style={styles.detailItem}>
                                    <span style={styles.detailKey}>Asset ID</span>
                                    <span style={styles.detailValue}>
                                      {selectedHolding?.assetId ?? "-"}
                                    </span>
                                  </div>
                                  <div style={styles.detailItem}>
                                    <span style={styles.detailKey}>Quantity</span>
                                    <span style={styles.detailValue}>
                                      {formatQuantity(selectedHolding?.quantity)}
                                    </span>
                                  </div>
                                  <div style={styles.detailItem}>
                                    <span style={styles.detailKey}>Average Cost</span>
                                    <span style={styles.detailValue}>
                                      {formatMoney(selectedHolding?.averageCost)}
                                    </span>
                                  </div>
                                  <div style={styles.detailItem}>
                                    <span style={styles.detailKey}>Latest Price</span>
                                    <span style={styles.detailValue}>
                                      {formatMoney(selectedHolding?.latestPrice)}
                                    </span>
                                  </div>
                                  <div style={styles.detailItem}>
                                    <span style={styles.detailKey}>Currency</span>
                                    <span style={styles.detailValue}>
                                      {selectedHolding?.costCurrency || "-"}
                                    </span>
                                  </div>
                                  <div style={styles.detailItem}>
                                    <span style={styles.detailKey}>PnL %</span>
                                    <span
                                      style={{
                                        ...styles.detailValue,
                                        color:
                                          Number(
                                            selectedHolding?.pnlPercent ?? 0
                                          ) >= 0
                                            ? "#22c55e"
                                            : "#ef4444",
                                      }}
                                    >
                                      {formatNumber(selectedHolding?.pnlPercent, 2)}%
                                    </span>
                                  </div>
                                  <div style={styles.detailItem}>
                                    <span style={styles.detailKey}>Purchase Date</span>
                                    <span style={styles.detailValue}>
                                      {formatDate(selectedHolding?.purchaseDate)}
                                    </span>
                                  </div>
                                  <div style={styles.detailItem}>
                                    <span style={styles.detailKey}>Account</span>
                                    <span style={styles.detailValue}>
                                      {selectedHolding?.accountName || "-"}
                                    </span>
                                  </div>
                                  <div style={styles.detailItem}>
                                    <span style={styles.detailKey}>Market</span>
                                    <span style={styles.detailValue}>
                                      {selectedHolding?.market || "-"}
                                    </span>
                                  </div>
                                  <div style={styles.detailItemWide}>
                                    <span style={styles.detailKey}>Notes</span>
                                    <span style={styles.detailValue}>
                                      {selectedHolding?.notes || "-"}
                                    </span>
                                  </div>
                                  <div style={styles.detailItem}>
                                    <span style={styles.detailKey}>Created At</span>
                                    <span style={styles.detailValue}>
                                      {formatDate(selectedHolding?.createdAt)}
                                    </span>
                                  </div>
                                  <div style={styles.detailItem}>
                                    <span style={styles.detailKey}>Updated At</span>
                                    <span style={styles.detailValue}>
                                      {formatDate(selectedHolding?.updatedAt)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </>
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

      {showModal && (
        <div style={styles.modalOverlay} onClick={closeFormModal}>
          <div
            style={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                {formMode === "add" ? "Add Holding" : "Edit Holding"}
              </h3>
              <button
                type="button"
                style={styles.modalCloseBtn}
                onClick={closeFormModal}
              >
                ✕
              </button>
            </div>

            <form style={styles.modalForm}>
              <div style={styles.formGrid}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Asset *</label>
                  <div style={styles.assetSelector}>
                    <input
                      type="text"
                      style={styles.input}
                      placeholder="Search by symbol or name..."
                      value={assetSearch}
                      onChange={(e) => setAssetSearch(e.target.value)}
                      autoComplete="off"
                    />

                    {assetSearch &&
                      !(
                        formData.assetSymbol &&
                        assetSearch.includes(formData.assetSymbol)
                      ) && (
                        <div style={styles.dropdown}>
                          {filteredAssets.length > 0 ? (
                            filteredAssets.map((asset) => (
                              <div
                                key={asset.id}
                                style={styles.dropdownItem}
                                onClick={() => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    assetId: asset.id,
                                    assetSymbol: asset.symbol,
                                  }));
                                  setAssetSearch(`${asset.symbol} - ${asset.name}`);
                                }}
                              >
                                <strong>{asset.symbol}</strong> - {asset.name}
                              </div>
                            ))
                          ) : (
                            <div>
                              <div style={styles.dropdownEmpty}>
                                No matching assets
                              </div>
                              <div
                                style={styles.createAssetOption}
                                onClick={() => {
                                  setNewAssetData({
                                    symbol: assetSearch.split(" ")[0].toUpperCase(),
                                    name: assetSearch,
                                    assetType: "STOCK",
                                    market: "",
                                  });
                                  setShowCreateAssetForm(true);
                                }}
                              >
                                + Create "{assetSearch}"
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                  </div>

                  {formData.assetId && formData.assetSymbol ? (
                    <div style={styles.selectedAsset}>
                      Selected: {formData.assetSymbol}
                    </div>
                  ) : null}
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Quantity *</label>
                  <input
                    style={styles.input}
                    type="number"
                    step="0.0001"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleFormChange}
                    placeholder="e.g. 10"
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Average Cost *</label>
                  <input
                    style={styles.input}
                    type="number"
                    step="0.0001"
                    name="averageCost"
                    value={formData.averageCost}
                    onChange={handleFormChange}
                    placeholder="e.g. 150.50"
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Currency</label>
                  <input
                    style={styles.input}
                    name="costCurrency"
                    value={formData.costCurrency}
                    onChange={handleFormChange}
                    placeholder="USD"
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Purchase Date</label>
                  <input
                    style={styles.input}
                    type="date"
                    name="purchaseDate"
                    value={formData.purchaseDate}
                    onChange={handleFormChange}
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Account</label>
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
                <label style={styles.label}>Notes</label>
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
                  type="button"
                  style={styles.primaryBtn}
                  disabled={submitting}
                  onClick={handleSubmitForm}
                >
                  {submitting ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  style={styles.secondaryBtn}
                  onClick={closeFormModal}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCreateAssetForm && (
        <div
          style={styles.modalOverlay}
          onClick={() => setShowCreateAssetForm(false)}
        >
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

            <div style={styles.modalForm}>
              <div style={styles.formGrid}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Symbol *</label>
                  <input
                    style={styles.input}
                    type="text"
                    value={newAssetData.symbol}
                    onChange={(e) =>
                      setNewAssetData((prev) => ({
                        ...prev,
                        symbol: e.target.value.toUpperCase(),
                      }))
                    }
                    placeholder="e.g. AAPL"
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Name *</label>
                  <input
                    style={styles.input}
                    type="text"
                    value={newAssetData.name}
                    onChange={(e) =>
                      setNewAssetData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="e.g. Apple Inc."
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Asset Type *</label>
                  <input
                    style={styles.input}
                    type="text"
                    value={newAssetData.assetType}
                    onChange={(e) =>
                      setNewAssetData((prev) => ({
                        ...prev,
                        assetType: e.target.value,
                      }))
                    }
                    placeholder="e.g. STOCK"
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Market</label>
                  <input
                    style={styles.input}
                    type="text"
                    value={newAssetData.market}
                    onChange={(e) =>
                      setNewAssetData((prev) => ({
                        ...prev,
                        market: e.target.value,
                      }))
                    }
                    placeholder="e.g. US"
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
  );
}

const styles = {
  page: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
    color: "#e2e8f0",
  },

  hero: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: "24px",
    padding: "8px 0 16px",
    borderBottom: "1px solid rgba(148,163,184,0.18)",
    flexWrap: "wrap",
  },

  overline: {
    fontSize: "12px",
    letterSpacing: "0.12em",
    color: "#60a5fa",
    fontWeight: 700,
    marginBottom: "6px",
  },

  pageTitle: {
    margin: 0,
    fontSize: "36px",
    lineHeight: 1.05,
    fontWeight: 700,
    color: "#f8fafc",
  },

  pageSubtitle: {
    margin: "8px 0 0",
    color: "#94a3b8",
    fontSize: "14px",
    maxWidth: "720px",
    lineHeight: 1.6,
  },

  heroActions: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },

  error: {
    color: "#fca5a5",
    fontSize: "14px",
    padding: "10px 0",
    borderTop: "1px solid rgba(239,68,68,0.28)",
    borderBottom: "1px solid rgba(239,68,68,0.28)",
  },

  filtersSection: {
    background: "#1e293b",
    borderTop: "1px solid #334155",
    borderBottom: "1px solid #334155",
  },

  sectionBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    padding: "12px 0",
    borderBottom: "1px solid #334155",
  },

  sectionTitle: {
    margin: 0,
    fontSize: "16px",
    fontWeight: 700,
    color: "#f8fafc",
  },

  sectionMeta: {
    fontSize: "12px",
    color: "#94a3b8",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  },

  filtersGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "14px",
    padding: "14px 0 16px",
  },

  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    minWidth: 0,
  },

  label: {
    fontSize: "12px",
    color: "#94a3b8",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  },

  input: {
    background: "#0f172a",
    border: "1px solid #334155",
    borderRadius: "0",
    padding: "11px 12px",
    color: "#e2e8f0",
    outline: "none",
  },

  textarea: {
    background: "#0f172a",
    border: "1px solid #334155",
    borderRadius: "0",
    padding: "11px 12px",
    color: "#e2e8f0",
    outline: "none",
    minHeight: "96px",
    resize: "vertical",
  },

  tableSection: {
    background: "#1e293b",
    borderTop: "1px solid #334155",
    borderBottom: "1px solid #334155",
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
    padding: "12px 14px",
    fontSize: "11px",
    color: "#94a3b8",
    borderBottom: "1px solid #334155",
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
  },

  thActions: {
    textAlign: "right",
    padding: "12px 14px",
    fontSize: "11px",
    color: "#94a3b8",
    borderBottom: "1px solid #334155",
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
  },

  td: {
    padding: "12px 14px",
    borderBottom: "1px solid #273449",
    color: "#e2e8f0",
    fontSize: "13px",
    whiteSpace: "nowrap",
  },

  tdSymbol: {
    padding: "12px 14px",
    borderBottom: "1px solid #273449",
    color: "#3b82f6",
    fontWeight: 700,
    fontSize: "13px",
    whiteSpace: "nowrap",
  },

  tdActions: {
    padding: "10px 14px",
    borderBottom: "1px solid #273449",
    textAlign: "right",
    whiteSpace: "nowrap",
  },

  tableRow: {
    transition: "background 0.15s ease",
  },

  detailCell: {
    padding: 0,
    borderBottom: "1px solid #334155",
    background: "#162132",
  },

  detailLoading: {
    padding: "18px 16px",
    color: "#94a3b8",
    fontSize: "13px",
  },

  detailPanel: {
    padding: "16px",
  },

  detailHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
    paddingBottom: "14px",
    borderBottom: "1px solid #334155",
    marginBottom: "14px",
    flexWrap: "wrap",
  },

  detailTitle: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#f8fafc",
  },

  detailSubtitle: {
    marginTop: "4px",
    fontSize: "12px",
    color: "#94a3b8",
  },

  detailHeaderStats: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },

  detailStat: {
    fontSize: "12px",
    color: "#cbd5e1",
    border: "1px solid #334155",
    padding: "6px 8px",
  },

  detailGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "12px 16px",
  },

  detailItem: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    minWidth: 0,
  },

  detailItemWide: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    gridColumn: "span 2",
    minWidth: 0,
  },

  detailKey: {
    fontSize: "11px",
    color: "#94a3b8",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },

  detailValue: {
    fontSize: "14px",
    color: "#e2e8f0",
    lineHeight: 1.4,
    wordBreak: "break-word",
  },

  primaryBtn: {
    background: "#3b82f6",
    color: "#fff",
    border: "1px solid #3b82f6",
    borderRadius: "0",
    padding: "11px 16px",
    fontSize: "13px",
    cursor: "pointer",
    fontWeight: 700,
  },

  secondaryBtnCompact: {
    background: "transparent",
    color: "#e2e8f0",
    border: "1px solid #334155",
    borderRadius: "0",
    padding: "11px 16px",
    fontSize: "13px",
    cursor: "pointer",
    fontWeight: 600,
  },

  secondaryBtn: {
    background: "#0f172a",
    color: "#e2e8f0",
    border: "1px solid #334155",
    borderRadius: "0",
    padding: "11px 16px",
    fontSize: "13px",
    cursor: "pointer",
    fontWeight: 600,
    width: "100%",
  },

  rowGhostBtn: {
    background: "transparent",
    color: "#cbd5e1",
    border: "1px solid #334155",
    borderRadius: "0",
    padding: "6px 10px",
    fontSize: "12px",
    cursor: "pointer",
    fontWeight: 600,
    marginRight: "8px",
  },

  rowDangerBtn: {
    background: "transparent",
    color: "#f87171",
    border: "1px solid rgba(239,68,68,0.35)",
    borderRadius: "0",
    padding: "6px 10px",
    fontSize: "12px",
    cursor: "pointer",
    fontWeight: 600,
  },

  empty: {
    color: "#94a3b8",
    fontSize: "14px",
    padding: "16px 0",
  },

  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.62)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "20px",
  },

  modalContent: {
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "0",
    padding: "20px",
    maxWidth: "760px",
    width: "100%",
    maxHeight: "88vh",
    overflowY: "auto",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.55)",
  },

  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "18px",
    paddingBottom: "12px",
    borderBottom: "1px solid #334155",
  },

  modalTitle: {
    margin: 0,
    color: "#e2e8f0",
    fontSize: "18px",
    fontWeight: 700,
  },

  modalCloseBtn: {
    background: "transparent",
    border: "none",
    color: "#94a3b8",
    fontSize: "22px",
    cursor: "pointer",
    padding: 0,
    width: "32px",
    height: "32px",
  },

  modalForm: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },

  modalActions: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginTop: "8px",
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
    borderRadius: "0",
    marginTop: "4px",
    zIndex: 20,
    maxHeight: "220px",
    overflowY: "auto",
  },

  dropdownItem: {
    padding: "10px 12px",
    color: "#e2e8f0",
    cursor: "pointer",
    borderBottom: "1px solid #273449",
  },

  dropdownEmpty: {
    padding: "10px 12px",
    color: "#94a3b8",
    fontSize: "13px",
    borderBottom: "1px solid #273449",
  },

  createAssetOption: {
    padding: "10px 12px",
    color: "#60a5fa",
    cursor: "pointer",
    backgroundColor: "rgba(59,130,246,0.08)",
    fontWeight: 600,
    fontSize: "13px",
  },

  selectedAsset: {
    marginTop: "8px",
    fontSize: "12px",
    color: "#60a5fa",
    fontWeight: 600,
  },
};