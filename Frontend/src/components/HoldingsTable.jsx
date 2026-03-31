export default function HoldingsTable({ data = [] }) {
  if (!data.length) {
    return (
      <section style={styles.card}>
        <h2 style={styles.title}>Top Holdings</h2>
        <div style={styles.empty}>No holdings data</div>
      </section>
    );
  }

  return (
    <section style={styles.card}>
      <h2 style={styles.title}>Top Holdings</h2>

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
                <tr key={row.holdingId ?? row.symbol} className="table-row">
                  <td style={styles.tdSymbol}>{row.symbol}</td>
                  <td style={styles.td}>{row.assetName}</td>
                  <td style={styles.td}>
                    {Number(row.quantity ?? 0).toFixed(4)}
                  </td>
                  <td style={styles.td}>
                    ${Number(row.averageCost ?? 0).toFixed(4)}
                  </td>
                  <td style={styles.td}>
                    ${Number(row.latestPrice ?? 0).toFixed(4)}
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
  card: {
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "20px",
    padding: "24px",
  },

  title: {
    marginTop: 0,
    marginBottom: "16px",
    color: "#e2e8f0",
    fontSize: "20px",
  },

  empty: {
    color: "#94a3b8",
    fontSize: "14px",
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
    borderBottom: "1px solid #1e293b",
    color: "#e2e8f0",
    fontSize: "14px",
  },

  tdSymbol: {
    padding: "14px",
    borderBottom: "1px solid #1e293b",
    color: "#3b82f6",
    fontWeight: 700,
  },
};