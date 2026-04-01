export default function HoldingsTable({ data = [] }) {
  if (!data.length) {
    return (
      <section style={styles.wrapper}>
        <div style={styles.empty}>No holdings data</div>
      </section>
    );
  }

  return (
    <section style={styles.wrapper}>
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Symbol</th>
              <th style={styles.th}>Asset Name</th>
              <th style={styles.th}>Quantity</th>
              <th style={styles.th}>Avg Cost</th>
              <th style={styles.th}>Latest Price</th>
              <th style={styles.th}>Market Value</th>
              <th style={styles.th}>PnL</th>
              <th style={styles.th}>Weight</th>
            </tr>
          </thead>

          <tbody>
            {data.map((row) => {
              const isPositive = Number(row.unrealizedPnl) >= 0;

              return (
                <tr key={row.holdingId ?? row.symbol} style={styles.row}>
                  <td style={styles.tdSymbol}>{row.symbol}</td>
                  <td style={styles.td}>{row.assetName}</td>
                  <td style={styles.td}>
                    {Math.round(Number(row.quantity ?? 0)).toLocaleString()}
                  </td>
                  <td style={styles.td}>
                    ${Number(row.averageCost ?? 0).toFixed(2)}
                  </td>
                  <td style={styles.td}>
                    ${Number(row.latestPrice ?? 0).toFixed(2)}
                  </td>
                  <td style={styles.td}>
                    ${Number(row.marketValue ?? 0).toLocaleString()}
                  </td>
                  <td
                    style={{
                      ...styles.td,
                      color: isPositive ? "#22c55e" : "#ef4444",
                      fontWeight: 700,
                    }}
                  >
                    ${Number(row.unrealizedPnl ?? 0).toLocaleString()}
                  </td>
                  <td style={styles.td}>
                    {Number(row.weightPct ?? 0).toFixed(2)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

const styles = {
  wrapper: {
    background: "#1e293b",
    borderTop: "1px solid #334155",
    borderBottom: "1px solid #334155",
    padding: "0", // ✅ 关键：去掉 padding
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
    padding: "10px 16px",
    fontSize: "11px",
    color: "#64748b",
    borderBottom: "1px solid #334155",
    fontWeight: 500,
    letterSpacing: "0.08em",
  },

  td: {
    padding: "10px 16px",
    borderBottom: "1px solid #273449",
    color: "#e2e8f0",
    fontSize: "13px",
  },

  tdSymbol: {
    padding: "10px 16px",
    borderBottom: "1px solid #273449",
    color: "#3b82f6",
    fontWeight: 700,
  },

  row: {
    transition: "background 0.15s ease",
  },

  empty: {
    color: "#94a3b8",
    fontSize: "14px",
    padding: "12px 16px",
  },
};