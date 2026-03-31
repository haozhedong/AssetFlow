export default function AIInsights() {
  return (
    <div style={styles.page}>
      <h1 style={styles.title}>AI Insights</h1>

      <div style={styles.cardLarge}>
        📊 Suggestion: Reduce concentration in Tech sector
      </div>

      <div style={styles.cardLarge}>
        💡 Opportunity: Increase ETF allocation for stability
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