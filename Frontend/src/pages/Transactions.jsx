import { Fragment, useEffect, useMemo, useState } from "react";
import {
  getAllTransactions,
  createBuyTransaction,
  createSellTransaction,
  deleteTransaction,
} from "../api/transactionsApi";

const emptyForm = {
  symbol: "",
  transactionType: "BUY",
  quantity: "",
  fee: "",
  accountName: "",
  notes: "",
};

const emptySuccessModal = {
  isOpen: false,
  transactionType: "BUY",
  symbol: "",
  previousAverageCost: 0,
  currentAverageCost: 0,
  currentPrice: 0,
  remainingQuantity: 0,
};

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [selectedType, setSelectedType] = useState("BUY");
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [expandedTransactionId, setExpandedTransactionId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [successModal, setSuccessModal] = useState(emptySuccessModal);

  const [filters, setFilters] = useState({
    symbol: "",
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
      setTransactions(data || []);
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
        symbol: String(formData.symbol || "").trim().toUpperCase(),
        transactionType: formData.transactionType,
        quantity: Number(formData.quantity),
        fee: formData.fee === "" ? 0 : Number(formData.fee),
        accountName: formData.accountName || "",
        notes: formData.notes || "",
      };

      if (!payload.symbol) {
        throw new Error("Symbol is required");
      }

      if (!payload.quantity || payload.quantity <= 0) {
        throw new Error("Quantity must be greater than 0");
      }

      let result;
      if (selectedType === "BUY") {
        result = await createBuyTransaction(payload);
      } else {
        result = await createSellTransaction(payload);
      }

      setSuccessModal({
        isOpen: true,
        transactionType: result.transactionType || selectedType,
        symbol: result.symbol || payload.symbol,
        previousAverageCost: Number(result.previousAverageCost ?? 0),
        currentAverageCost: Number(result.currentAverageCost ?? 0),
        currentPrice: Number(result.price ?? 0),
        remainingQuantity: Number(result.remainingQuantity ?? 0),
      });

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

  async function handleDelete(transaction) {
    if (!transaction?.id) {
      setError("Please select one transaction first");
      return;
    }

    const confirmed = window.confirm(
        `Delete transaction #${transaction.id} (${transaction.symbol || "-"})?`
    );
    if (!confirmed) return;

    try {
      setError("");
      await deleteTransaction(transaction.id);

      if (selectedTransaction?.id === transaction.id) {
        setSelectedTransaction(null);
      }
      if (expandedTransactionId === transaction.id) {
        setExpandedTransactionId(null);
      }

      await fetchTransactions();
    } catch (err) {
      console.error(err);
      setError("Failed to delete transaction");
    }
  }

  function handleRowClick(item) {
    setSelectedTransaction(item);
    setExpandedTransactionId((prev) => (prev === item.id ? null : item.id));
  }

  function closeSuccessModal() {
    setSuccessModal(emptySuccessModal);
  }

  const filteredTransactions = useMemo(() => {
    return transactions.filter((item) => {
      const symbolMatch = filters.symbol
          ? String(item.symbol || "")
              .toLowerCase()
              .includes(filters.symbol.toLowerCase())
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
            item.symbol,
            item.transactionType,
            item.accountName,
            item.notes,
            item.transactionDate,
            item.createdAt,
            item.quantity,
            item.price,
            item.fee,
          ]
              .join(" ")
              .toLowerCase()
              .includes(filters.keyword.toLowerCase())
          : true;

      return symbolMatch && typeMatch && accountMatch && keywordMatch;
    });
  }, [transactions, filters]);

  function formatQuantity(value) {
    return Math.round(Number(value ?? 0)).toLocaleString();
  }

  function formatMoney(value, digits = 2) {
    return `$${Number(value ?? 0).toLocaleString(undefined, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    })}`;
  }

  function formatDateTime(value) {
    if (!value) return "-";
    return String(value).replace("T", " ");
  }

  function getTypeColor(type) {
    return String(type || "").toUpperCase() === "BUY" ? "#22c55e" : "#f97316";
  }

  const isBuy =
      successModal.transactionType === "buy" ||
      successModal.transactionType === "BUY";

  return (
      <div style={styles.page}>
        {successModal.isOpen && (
            <div style={styles.modalOverlay} onClick={closeSuccessModal}>
              <div style={styles.successModal} onClick={(e) => e.stopPropagation()}>
                <div style={styles.successModalHeader}>
                  <h3 style={styles.successModalTitle}>
                    {isBuy ? "Purchase Successful" : "Sale Successful"}
                  </h3>
                  <button
                      style={styles.successModalCloseBtn}
                      onClick={closeSuccessModal}
                      type="button"
                  >
                    ×
                  </button>
                </div>

                <div style={styles.successModalBody}>
                  <div
                      style={{
                        ...styles.successSymbol,
                        color: isBuy ? "#22c55e" : "#f97316",
                      }}
                  >
                    {successModal.symbol}
                  </div>

                  {isBuy ? (
                      <div style={styles.buyComparisonGrid}>
                        <div style={styles.summaryCard}>
                          <div style={styles.summaryLabel}>Previous Average Cost</div>
                          <div style={styles.summaryValue}>
                            {formatMoney(successModal.previousAverageCost)}
                          </div>
                        </div>

                        <div style={styles.summaryArrow}>→</div>

                        <div style={styles.summaryCard}>
                          <div style={styles.summaryLabel}>Current Average Cost</div>
                          <div style={styles.summaryValue}>
                            {formatMoney(successModal.currentAverageCost)}
                          </div>
                        </div>
                      </div>
                  ) : (
                      <>
                        <div style={styles.sellComparisonGrid}>
                          <div style={styles.summaryCard}>
                            <div style={styles.summaryLabel}>Previous Average Cost</div>
                            <div style={styles.summaryValue}>
                              {formatMoney(successModal.previousAverageCost)}
                            </div>
                          </div>

                          <div style={styles.summaryArrow}>→</div>

                          <div style={styles.summaryCard}>
                            <div style={styles.summaryLabel}>Current Sell Price</div>
                            <div style={styles.summaryValue}>
                              {formatMoney(successModal.currentPrice)}
                            </div>
                          </div>
                        </div>

                        <div style={styles.remainingQuantityCard}>
                          <div style={styles.summaryLabel}>Remaining Quantity</div>
                          <div style={styles.remainingQuantityValue}>
                            {formatQuantity(successModal.remainingQuantity)}
                          </div>
                        </div>
                      </>
                  )}

                  <button
                      style={styles.successModalConfirmBtn}
                      onClick={closeSuccessModal}
                      type="button"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
        )}

        <section style={styles.hero}>
          <div>
            <div style={styles.overline}>TRANSACTIONS</div>
            <h1 style={styles.pageTitle}>Transaction Entry & History</h1>
            <p style={styles.pageSubtitle}>
              Record buy and sell activity by asset symbol, then review each trade
              in a terminal-style history table.
            </p>
          </div>

          <div style={styles.heroActions}>
            <button
                style={
                  selectedType === "BUY"
                      ? styles.primaryBtn
                      : styles.secondaryBtnCompact
                }
                type="button"
                onClick={() => handleChooseType("BUY")}
            >
              Buy
            </button>
            <button
                style={
                  selectedType === "SELL"
                      ? styles.primaryBtn
                      : styles.secondaryBtnCompact
                }
                type="button"
                onClick={() => handleChooseType("SELL")}
            >
              Sell
            </button>
          </div>
        </section>

        {error ? <div style={styles.error}>{error}</div> : null}

        <section style={styles.entrySection}>
          <div style={styles.sectionBar}>
            <h2 style={styles.sectionTitle}>Transaction Entry</h2>
            <span style={styles.sectionMeta}>
            {selectedType === "BUY" ? "Buy Order" : "Sell Order"}
          </span>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGrid}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Asset Symbol</label>
                <input
                    style={styles.input}
                    name="symbol"
                    value={formData.symbol}
                    onChange={handleFormChange}
                    placeholder="e.g. AAPL"
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Transaction Type</label>
                <input
                    style={styles.input}
                    name="transactionType"
                    value={formData.transactionType}
                    onChange={handleFormChange}
                    readOnly
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Quantity</label>
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
                <label style={styles.label}>Fee</label>
                <input
                    style={styles.input}
                    type="number"
                    step="0.01"
                    name="fee"
                    value={formData.fee}
                    onChange={handleFormChange}
                    placeholder="e.g. 1.50"
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

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Notes</label>
                <input
                    style={styles.input}
                    name="notes"
                    value={formData.notes}
                    onChange={handleFormChange}
                    placeholder="Optional notes"
                />
              </div>
            </div>

            <div style={styles.formActions}>
              <button style={styles.primaryBtn} type="submit" disabled={submitting}>
                {submitting
                    ? "Submitting..."
                    : selectedType === "BUY"
                        ? "Submit Buy"
                        : "Submit Sell"}
              </button>
            </div>
          </form>
        </section>

        <section style={styles.filtersSection}>
          <div style={styles.sectionBar}>
            <h2 style={styles.sectionTitle}>Filters</h2>
          </div>

          <div style={styles.filtersGrid}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Symbol</label>
              <input
                  style={styles.input}
                  value={filters.symbol}
                  onChange={(e) =>
                      setFilters((prev) => ({ ...prev, symbol: e.target.value }))
                  }
                  placeholder="e.g. AAPL"
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Type</label>
              <input
                  style={styles.input}
                  value={filters.transactionType}
                  onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        transactionType: e.target.value,
                      }))
                  }
                  placeholder="BUY / SELL"
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Account</label>
              <input
                  style={styles.input}
                  value={filters.accountName}
                  onChange={(e) =>
                      setFilters((prev) => ({ ...prev, accountName: e.target.value }))
                  }
                  placeholder="Main Account"
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Keyword</label>
              <input
                  style={styles.input}
                  value={filters.keyword}
                  onChange={(e) =>
                      setFilters((prev) => ({ ...prev, keyword: e.target.value }))
                  }
                  placeholder="Search symbol, notes..."
              />
            </div>
          </div>
        </section>

        <section style={styles.tableSection}>
          <div style={styles.sectionBar}>
            <h2 style={styles.sectionTitle}>Transaction History</h2>
            <span style={styles.sectionMeta}>
            {filteredTransactions.length} record
              {filteredTransactions.length === 1 ? "" : "s"}
          </span>
          </div>

          {loading ? (
              <div style={styles.empty}>Loading transactions...</div>
          ) : (
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                  <tr>
                    <th style={styles.th}>ID</th>
                    <th style={styles.th}>Symbol</th>
                    <th style={styles.th}>Type</th>
                    <th style={styles.th}>Qty</th>
                    <th style={styles.th}>Price</th>
                    <th style={styles.th}>Fee</th>
                    <th style={styles.th}>Account</th>
                    <th style={styles.th}>Transaction Date</th>
                    <th style={styles.thActions}>Actions</th>
                  </tr>
                  </thead>

                  <tbody>
                  {filteredTransactions.map((item) => {
                    const isExpanded = expandedTransactionId === item.id;

                    return (
                        <Fragment key={item.id}>
                          <tr
                              style={{
                                ...styles.tableRow,
                                background: isExpanded
                                    ? "rgba(59,130,246,0.08)"
                                    : "transparent",
                              }}
                          >
                            <td
                                style={{ ...styles.td, cursor: "pointer" }}
                                onClick={() => handleRowClick(item)}
                            >
                              {item.id ?? "-"}
                            </td>
                            <td
                                style={{ ...styles.tdSymbol, cursor: "pointer" }}
                                onClick={() => handleRowClick(item)}
                            >
                              {item.symbol || "-"}
                            </td>
                            <td
                                style={{
                                  ...styles.td,
                                  color: getTypeColor(item.transactionType),
                                  fontWeight: 700,
                                  cursor: "pointer",
                                }}
                                onClick={() => handleRowClick(item)}
                            >
                              {String(item.transactionType || "-").toUpperCase()}
                            </td>
                            <td
                                style={{ ...styles.td, cursor: "pointer" }}
                                onClick={() => handleRowClick(item)}
                            >
                              {formatQuantity(item.quantity)}
                            </td>
                            <td
                                style={{ ...styles.td, cursor: "pointer" }}
                                onClick={() => handleRowClick(item)}
                            >
                              {formatMoney(item.price)}
                            </td>
                            <td
                                style={{ ...styles.td, cursor: "pointer" }}
                                onClick={() => handleRowClick(item)}
                            >
                              {formatMoney(item.fee)}
                            </td>
                            <td
                                style={{ ...styles.td, cursor: "pointer" }}
                                onClick={() => handleRowClick(item)}
                            >
                              {item.accountName || "-"}
                            </td>
                            <td
                                style={{ ...styles.td, cursor: "pointer" }}
                                onClick={() => handleRowClick(item)}
                            >
                              {formatDateTime(item.transactionDate)}
                            </td>
                            <td style={styles.tdActions}>
                              <button
                                  type="button"
                                  style={styles.rowDangerBtn}
                                  onClick={() => handleDelete(item)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>

                          {isExpanded && (
                              <tr>
                                <td colSpan={9} style={styles.detailCell}>
                                  <div style={styles.detailPanel}>
                                    <div style={styles.detailHeader}>
                                      <div>
                                        <div style={styles.detailTitle}>
                                          {item.symbol || "-"} ·{" "}
                                          {String(item.transactionType || "-").toUpperCase()}
                                        </div>
                                        <div style={styles.detailSubtitle}>
                                          Click the same row again to collapse.
                                        </div>
                                      </div>

                                      <div style={styles.detailHeaderStats}>
                                  <span style={styles.detailStat}>
                                    Qty {formatQuantity(item.quantity)}
                                  </span>
                                        <span
                                            style={{
                                              ...styles.detailStat,
                                              color: getTypeColor(item.transactionType),
                                            }}
                                        >
                                    {String(item.transactionType || "-").toUpperCase()}
                                  </span>
                                      </div>
                                    </div>

                                    <div style={styles.detailGrid}>
                                      <div style={styles.detailItem}>
                                        <span style={styles.detailKey}>Transaction ID</span>
                                        <span style={styles.detailValue}>
                                    {item.id ?? "-"}
                                  </span>
                                      </div>
                                      <div style={styles.detailItem}>
                                        <span style={styles.detailKey}>Symbol</span>
                                        <span style={styles.detailValue}>
                                    {item.symbol || "-"}
                                  </span>
                                      </div>
                                      <div style={styles.detailItem}>
                                        <span style={styles.detailKey}>Type</span>
                                        <span
                                            style={{
                                              ...styles.detailValue,
                                              color: getTypeColor(item.transactionType),
                                            }}
                                        >
                                    {String(item.transactionType || "-").toUpperCase()}
                                  </span>
                                      </div>
                                      <div style={styles.detailItem}>
                                        <span style={styles.detailKey}>Quantity</span>
                                        <span style={styles.detailValue}>
                                    {formatQuantity(item.quantity)}
                                  </span>
                                      </div>
                                      <div style={styles.detailItem}>
                                        <span style={styles.detailKey}>Price</span>
                                        <span style={styles.detailValue}>
                                    {formatMoney(item.price)}
                                  </span>
                                      </div>
                                      <div style={styles.detailItem}>
                                        <span style={styles.detailKey}>Fee</span>
                                        <span style={styles.detailValue}>
                                    {formatMoney(item.fee)}
                                  </span>
                                      </div>
                                      <div style={styles.detailItem}>
                                        <span style={styles.detailKey}>Account</span>
                                        <span style={styles.detailValue}>
                                    {item.accountName || "-"}
                                  </span>
                                      </div>
                                      <div style={styles.detailItem}>
                                  <span style={styles.detailKey}>
                                    Transaction Date
                                  </span>
                                        <span style={styles.detailValue}>
                                    {formatDateTime(item.transactionDate)}
                                  </span>
                                      </div>
                                      <div style={styles.detailItemWide}>
                                        <span style={styles.detailKey}>Notes</span>
                                        <span style={styles.detailValue}>
                                    {item.notes || "-"}
                                  </span>
                                      </div>
                                      <div style={styles.detailItem}>
                                        <span style={styles.detailKey}>Created At</span>
                                        <span style={styles.detailValue}>
                                    {formatDateTime(item.createdAt)}
                                  </span>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                          )}
                        </Fragment>
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

  entrySection: {
    background: "#1e293b",
    borderTop: "1px solid #334155",
    borderBottom: "1px solid #334155",
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

  form: {
    padding: "14px 0 16px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "14px",
  },

  formActions: {
    display: "flex",
    justifyContent: "flex-start",
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

  successModal: {
    width: "100%",
    maxWidth: "420px",   // 再砍一半
    background: "#1e293b",
    border: "1px solid #334155",
    boxShadow: "0 10px 28px rgba(0,0,0,0.45)",
  },

  successModalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 12px",
    borderBottom: "1px solid #334155",
  },

  successModalTitle: {
    margin: 0,
    color: "#f8fafc",
    fontSize: "14px",
    fontWeight: 700,
  },

  successModalCloseBtn: {
    background: "transparent",
    border: "none",
    color: "#94a3b8",
    fontSize: "22px",
    lineHeight: 1,
    cursor: "pointer",
    width: "22px",
    height: "22px",
  },

  successModalBody: {
    padding: "14px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  successSymbol: {
    textAlign: "center",
    fontSize: "28px",
    fontWeight: 800,
    lineHeight: 1,
  },

  buyComparisonGrid: {
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr",
    alignItems: "center",
    gap: "8px",
  },

  sellComparisonGrid: {
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr",
    alignItems: "center",
    gap: "8px",
  },

  summaryCard: {
    background: "#020b24",
    border: "1px solid #334155",
    padding: "10px",
    minHeight: "70px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },

  summaryLabel: {
    fontSize: "9px",
    color: "#94a3b8",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    marginBottom: "4px",
  },

  summaryValue: {
    fontSize: "14px",
    fontWeight: 700,
    color: "#e2e8f0",
  },

  summaryArrow: {
    fontSize: "20px",
    color: "#60a5fa",
    fontWeight: 700,
    textAlign: "center",
  },

  remainingQuantityCard: {
    background: "#020b24",
    border: "1px solid #334155",
    padding: "10px",
  },

  remainingQuantityValue: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#e2e8f0",
  },

  successModalConfirmBtn: {
    marginTop: "4px",
    background: "#3b82f6",
    color: "#fff",
    border: "1px solid #3b82f6",
    padding: "10px",
    fontSize: "12px",
    cursor: "pointer",
    fontWeight: 700,
    width: "100%",
  },
};