import { useEffect, useMemo, useState } from "react";
import {
  getAllTransactions,
  createBuyTransaction,
  createSellTransaction,
  deleteTransaction,
} from "../api/transactionsApi";

const emptyForm = {
  assetId: "",
  transactionType: "BUY",
  quantity: "",
  price: "",
  fee: "",
  transactionDate: "",
  accountName: "",
  notes: "",
};

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [selectedType, setSelectedType] = useState("BUY");
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    assetId: "",
    transactionType: "",
    accountName: "",
    keyword: "",
  });

  const [formData, setFormData] = useState({
    ...emptyForm,
    transactionType: "BUY",
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  async function fetchTransactions() {
    try {
      setLoading(true);
      setError("");
      const data = await getAllTransactions();
      setTransactions(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }

  function handleFormChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleChooseType(type) {
    setSelectedType(type);
    setFormData((prev) => ({
      ...prev,
      transactionType: type,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError("");

      const payload = {
        assetId: Number(formData.assetId),
        transactionType: formData.transactionType,
        quantity: Number(formData.quantity),
        price: Number(formData.price),
        fee: formData.fee === "" ? 0 : Number(formData.fee),
        transactionDate: formData.transactionDate
          ? new Date(formData.transactionDate).toISOString().slice(0, 19)
          : new Date().toISOString().slice(0, 19),
        accountName: formData.accountName || "",
        notes: formData.notes || "",
      };

      if (!payload.assetId || payload.assetId <= 0) {
        throw new Error("assetId must be greater than 0");
      }
      if (!payload.quantity || payload.quantity <= 0) {
        throw new Error("quantity must be greater than 0");
      }
      if (!payload.price || payload.price <= 0) {
        throw new Error("price must be greater than 0");
      }

      if (selectedType === "BUY") {
        await createBuyTransaction(payload);
      } else {
        await createSellTransaction(payload);
      }

      setFormData({
        ...emptyForm,
        transactionType: selectedType,
      });

      await fetchTransactions();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to submit transaction");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteSelected() {
    if (!selectedTransaction?.id) {
      setError("Please select one transaction first");
      return;
    }

    const confirmed = window.confirm(
      `Delete transaction #${selectedTransaction.id}?`
    );
    if (!confirmed) return;

    try {
      setError("");
      await deleteTransaction(selectedTransaction.id);
      setSelectedTransaction(null);
      await fetchTransactions();
    } catch (err) {
      console.error(err);
      setError("Failed to delete transaction");
    }
  }

  const filteredTransactions = useMemo(() => {
    return transactions.filter((item) => {
      const assetIdMatch = filters.assetId
        ? String(item.assetId ?? "").includes(filters.assetId)
        : true;

      const typeMatch = filters.transactionType
        ? String(item.transactionType || "")
            .toLowerCase()
            .includes(filters.transactionType.toLowerCase())
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
            item.transactionType,
            item.accountName,
            item.notes,
            item.transactionDate,
          ]
            .join(" ")
            .toLowerCase()
            .includes(filters.keyword.toLowerCase())
        : true;

      return assetIdMatch && typeMatch && accountMatch && keywordMatch;
    });
  }, [transactions, filters]);

  function formatNumber(value, digits = 2) {
    return Number(value ?? 0).toFixed(digits);
  }

  function formatMoney(value, digits = 2) {
    return `$${Number(value ?? 0).toLocaleString(undefined, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    })}`;
  }

  function formatDateTime(value) {
    if (!value) return "-";
    return value.replace("T", " ");
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>Transactions</div>

      {error ? <div style={styles.error}>{error}</div> : null}

      <div style={styles.layout}>
        <section style={styles.sidebar}>
          <h3 style={styles.sectionTitle}>Actions</h3>

          <button
            style={selectedType === "BUY" ? styles.primaryBtn : styles.secondaryBtn}
            onClick={() => handleChooseType("BUY")}
          >
            Buy
          </button>

          <button
            style={selectedType === "SELL" ? styles.primaryBtn : styles.secondaryBtn}
            onClick={() => handleChooseType("SELL")}
          >
            Sell
          </button>

          <button
            style={styles.secondaryBtn}
            onClick={handleDeleteSelected}
          >
            Delete
          </button>
        </section>

        <div style={styles.mainColumn}>
          <section style={styles.formCard}>
            <h3 style={styles.sectionTitle}>Transaction Entry</h3>

            <form onSubmit={handleSubmit} style={styles.form}>
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
                  <label style={styles.label}>transaction_type</label>
                  <input
                    style={styles.input}
                    name="transactionType"
                    value={formData.transactionType}
                    onChange={handleFormChange}
                    readOnly
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
                  <label style={styles.label}>price</label>
                  <input
                    style={styles.input}
                    name="price"
                    value={formData.price}
                    onChange={handleFormChange}
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>fee</label>
                  <input
                    style={styles.input}
                    name="fee"
                    value={formData.fee}
                    onChange={handleFormChange}
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>transaction_date</label>
                  <input
                    style={styles.input}
                    type="datetime-local"
                    name="transactionDate"
                    value={formData.transactionDate}
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

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>notes</label>
                  <input
                    style={styles.input}
                    name="notes"
                    value={formData.notes}
                    onChange={handleFormChange}
                  />
                </div>
              </div>

              <div style={styles.submitRow}>
                <button type="submit" style={styles.primaryBtn} disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </form>
          </section>

          <section style={styles.historyCard}>
            <h3 style={styles.sectionTitle}>Transaction History</h3>

            <div style={styles.filtersRow}>
              <input
                style={styles.input}
                placeholder="asset_id"
                value={filters.assetId}
                onChange={(e) =>
                  setFilters({ ...filters, assetId: e.target.value })
                }
              />
              <input
                style={styles.input}
                placeholder="transaction_type"
                value={filters.transactionType}
                onChange={(e) =>
                  setFilters({ ...filters, transactionType: e.target.value })
                }
              />
              <input
                style={styles.input}
                placeholder="account_name"
                value={filters.accountName}
                onChange={(e) =>
                  setFilters({ ...filters, accountName: e.target.value })
                }
              />
              <input
                style={styles.input}
                placeholder="keyword"
                value={filters.keyword}
                onChange={(e) =>
                  setFilters({ ...filters, keyword: e.target.value })
                }
              />
            </div>

            {loading ? (
              <div style={styles.empty}>Loading transactions...</div>
            ) : (
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Date</th>
                      <th style={styles.th}>Type</th>
                      <th style={styles.th}>Asset ID</th>
                      <th style={styles.th}>Qty</th>
                      <th style={styles.th}>Price</th>
                      <th style={styles.th}>Fee</th>
                      <th style={styles.th}>Account</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((item) => {
                      const isSelected = selectedTransaction?.id === item.id;

                      return (
                        <tr
                          key={item.id}
                          onClick={() => setSelectedTransaction(item)}
                          style={{
                            background: isSelected
                              ? "rgba(59,130,246,0.10)"
                              : "transparent",
                            cursor: "pointer",
                          }}
                        >
                          <td style={styles.td}>{formatDateTime(item.transactionDate)}</td>
                          <td style={styles.td}>{item.transactionType}</td>
                          <td style={styles.td}>{item.assetId}</td>
                          <td style={styles.td}>{formatNumber(item.quantity, 4)}</td>
                          <td style={styles.td}>{formatMoney(item.price, 2)}</td>
                          <td style={styles.td}>{formatMoney(item.fee, 2)}</td>
                          <td style={styles.td}>{item.accountName || "-"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {!filteredTransactions.length && (
                  <div style={styles.empty}>No matching transactions</div>
                )}
              </div>
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

  sidebar: {
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "20px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
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

  mainColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  formCard: {
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "20px",
    padding: "20px",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "16px",
  },

  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },

  submitRow: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "8px",
  },

  historyCard: {
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "20px",
    padding: "20px",
    minHeight: "400px",
  },

  filtersRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "12px",
    marginBottom: "16px",
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
    marginTop: "10px",
  },
};