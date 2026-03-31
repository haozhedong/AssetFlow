export default function AssetsPage() {
  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Assets</h1>

      <div style={styles.cards}>
        <div style={styles.card}>Total Assets: 24</div>
        <div style={styles.card}>Active: 18</div>
        <div style={styles.card}>Types: 5</div>
      </div>

      <div style={styles.tableCard}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Name</th>
              <th>Type</th>
              <th>Market</th>
              <th>Currency</th>
              <th>Sector</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>AAPL</td>
              <td>Apple Inc.</td>
              <td>Stock</td>
              <td>US</td>
              <td>USD</td>
              <td>Tech</td>
              <td>Active</td>
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