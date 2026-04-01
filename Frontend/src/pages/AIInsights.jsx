import AiPortfolioDoctor from "../components/AiPortfolioDoctor";

export default function AIInsights() {
  return (
      <div style={styles.page}>
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <h1 style={styles.title}>AI Insights</h1>
          </div>

          <div style={styles.contentBlock}>
            <AiPortfolioDoctor />
          </div>
        </section>
      </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#050b14",
    color: "#e5e7eb",
    fontFamily:
        "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    padding: "0",
  },

  section: {
    padding: "24px",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    marginBottom: "24px",
    flexWrap: "wrap",
  },

  title: {
    margin: 0,
    fontSize: "32px",
    fontWeight: 700,
    color: "#f8fafc",
    lineHeight: 1.1,
  },

  contentBlock: {
    paddingTop: "8px",
  },
};