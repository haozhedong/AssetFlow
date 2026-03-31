export default function Holdings() {
  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Holdings</h1>

      <div style={styles.cards}>
        <div style={styles.card}>Total Value: $152,430</div>
        <div style={styles.card}>PnL: +$2,300</div>
        <div style={styles.card}>Positions: 18</div>
      </div>

      <div style={styles.tableCard}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Quantity</th>
              <th>Avg Cost</th>
              <th>Price</th>
              <th>Value</th>
              <th>PnL</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>AAPL</td>
              <td>35</td>
              <td>$120</td>
              <td>$145</td>
              <td>$5,000</td>
              <td style={{ color: "#22c55e" }}>+$886</td>
            </tr>
          </tbody>
        </table>
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

  title: {
    color: "#e2e8f0",
    fontSize: "26px",
    margin: 0,
  },

  cards: {
    display: "flex",
    gap: "16px",
  },

  card: {
    background: "#1e293b",
    border: "1px solid #334155",
    padding: "16px",
    borderRadius: "12px",
    color: "#e2e8f0",
    flex: 1,
  },

  cardLarge: {
    background: "#1e293b",
    border: "1px solid #334155",
    padding: "20px",
    borderRadius: "16px",
    color: "#e2e8f0",
  },

  tableCard: {
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "16px",
    padding: "20px",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    color: "#e2e8f0",
  },
};