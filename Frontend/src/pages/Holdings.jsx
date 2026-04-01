import { useEffect, useMemo, useState } from "react";
import {
  getAllHoldings,
  getHoldingById,
  createHolding,
  updateHolding,
  deleteHolding,
  exportHoldingsToCsv,
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
  const [selectedHolding, setSelectedHolding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formMode, setFormMode] = useState(""); // "", "add", "edit"
  const [formData, setFormData] = useState(emptyForm);

  const [filters, setFilters] = useState({
    assetId: "",
    accountName: "",
    costCurrency: "",
    keyword: "",
  });

  useEffect(() => {
    fetchHoldings();
  }, []);

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
      quantity: selectedHolding.quantity ?? "",
      averageCost: selectedHolding.averageCost ?? "",
      costCurrency: selectedHolding.costCurrency ?? "USD",
      purchaseDate: selectedHolding.purchaseDate ?? "",
      accountName: selectedHolding.accountName ?? "",
      notes: selectedHolding.notes ?? "",
    });
  }

  function closeForm() {
    setFormMode("");
    setFormData(emptyForm);
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
        throw new Error("assetId must be greater than 0");
      }

      if (!payload.quantity || payload.quantity <= 0) {
        throw new Error("quantity must be greater than 0");
      }

      if (!payload.averageCost || payload.averageCost <= 0) {
        throw new Error("averageCost must be greater than 0");
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

      closeForm();
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

  const filteredHoldings = useMemo(() => {
    return holdings.filter((item) => {
      const assetIdMatch = filters.assetId
        ? String(item.assetId ?? "").includes(filters.assetId)
        : true;

      const accountMatch = filters.accountName
        ? String(item.accountName || "")
            .toLowerCase()
            .includes(filters.accountName.toLowerCase())
        : true;

      const currencyMatch = filters.costCurrency
        ? String(item.costCurrency || "")
            .toLowerCase()
            .includes(filters.costCurrency.toLowerCase())
        : true;

      const keywordMatch = filters.keyword
        ? [
            item.id,
            item.assetId,
            item.accountName,
            item.costCurrency,
            item.notes,
            item.purchaseDate,
          ]
            .join(" ")
            .toLowerCase()
            .includes(filters.keyword.toLowerCase())
        : true;

      return assetIdMatch && accountMatch && currencyMatch && keywordMatch;
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

          <label style={styles.label}>asset_id</label>
          <input
            style={styles.input}
            value={filters.assetId}
            onChange={(e) =>
              setFilters({ ...filters, assetId: e.target.value })
            }
          />

          <label style={styles.label}>account_name</label>
          <input
            style={styles.input}
            value={filters.accountName}
            onChange={(e) =>
              setFilters({ ...filters, accountName: e.target.value })
            }
          />

          <label style={styles.label}>cost_currency</label>
          <input
            style={styles.input}
            value={filters.costCurrency}
            onChange={(e) =>
              setFilters({ ...filters, costCurrency: e.target.value })
            }
          />

          <label style={styles.label}>keyword</label>
          <input
            style={styles.input}
            value={filters.keyword}
            onChange={(e) =>
              setFilters({ ...filters, keyword: e.target.value })
            }
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
                      <th style={styles.th}>ID</th>
                      <th style={styles.th}>Asset ID</th>
                      <th style={styles.th}>Qty</th>
                      <th style={styles.th}>Avg Cost</th>
                      <th style={styles.th}>Currency</th>
                      <th style={styles.th}>Purchase Date</th>
                      <th style={styles.th}>Account</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredHoldings.map((item) => {
                      const isSelected = selectedHolding?.id === item.id;

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
                          <td style={styles.td}>{item.id}</td>
                          <td style={styles.td}>{item.assetId}</td>
                          <td style={styles.td}>{formatNumber(item.quantity, 4)}</td>
                          <td style={styles.td}>
                            {formatNumber(item.averageCost, 4)}
                          </td>
                          <td style={styles.td}>{item.costCurrency || "-"}</td>
                          <td style={styles.td}>{formatDate(item.purchaseDate)}</td>
                          <td style={styles.td}>{item.accountName || "-"}</td>
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
                    <span style={styles.detailKey}>quantity</span>
                    <span>{formatNumber(selectedHolding.quantity, 4)}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailKey}>average_cost</span>
                    <span>{formatNumber(selectedHolding.averageCost, 4)}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailKey}>cost_currency</span>
                    <span>{selectedHolding.costCurrency || "-"}</span>
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
                </div>
              ) : (
                <div style={styles.empty}>Select one holding</div>
              )}
            </section>

            <section style={styles.actionCard}>
              <h3 style={styles.sectionTitle}>Actions</h3>

              <button style={styles.primaryBtn} onClick={openAddForm}>
                Add Holding
              </button>
              <button style={styles.secondaryBtn} onClick={openEditForm}>
                Edit Holding
              </button>
              <button style={styles.secondaryBtn} onClick={handleDelete}>
                Delete Holding
              </button>
              <button style={styles.secondaryBtn} onClick={handleExportCsv}>
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
    minHeight: "650px",
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
  },

  actionCard: {
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "20px",
    padding: "20px",
    minHeight: "250px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
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
  },

  secondaryBtn: {
    background: "#0f172a",
    color: "#e2e8f0",
    border: "1px solid #334155",
    borderRadius: "12px",
    padding: "12px 16px",
    fontSize: "14px",
    cursor: "pointer",
  },

  empty: {
    color: "#94a3b8",
    fontSize: "14px",
  },
};