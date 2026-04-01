export default function KpiCards({ data }) {
  if (!data || !data.summary) {
    return <div style={{ color: "#94a3b8", padding: "12px 0" }}>Loading...</div>;
  }

  const summary = data.summary;

  const kpis = [
    {
      label: "Total Market Value",
      value: `$${Number(summary.totalMarketValue ?? 0).toLocaleString()}`,
      color: "#22c55e",
    },
    {
      label: "Total Return",
      value: `${summary.returnPct ?? 0}%`,
      color: "#22c55e",
    },
    {
      label: "Holding Count",
      value: summary.holdingCount ?? 0,
      color: "#e2e8f0",
    },
    {
      label: "PnL",
      value: `$${Number(summary.unrealizedPnl ?? 0).toLocaleString()}`,
      color: "#22c55e",
    },
  ];

  return (
    <section style={styles.wrapper}>
      <h2 style={styles.heading}>Summary</h2>

      <div style={styles.grid}>
        {kpis.map((item, index) => (
          <div
            key={item.label}
            style={{
              ...styles.item,
              borderRight:
                index === kpis.length - 1
                  ? "none"
                  : "1px solid rgba(148, 163, 184, 0.18)",
            }}
          >
            <div style={styles.label}>{item.label}</div>
            <div style={{ ...styles.value, color: item.color }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

const styles = {
  wrapper: {
    padding: "0",
    background: "transparent",
    border: "none",
    borderRadius: "0",
  },

  heading: {
    margin: "0 0 12px 0",
    color: "#e5e7eb",
    fontSize: "16px",
    fontWeight: 700,
    letterSpacing: "0.02em",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    borderTop: "1px solid rgba(148, 163, 184, 0.18)",
    borderBottom: "1px solid rgba(148, 163, 184, 0.18)",
  },

  item: {
    padding: "16px 18px",
    background: "transparent",
    borderRadius: "0",
    minWidth: 0,
  },

  label: {
    fontSize: "12px",
    color: "#94a3b8",
    marginBottom: "8px",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },

  value: {
    fontSize: "24px",
    fontWeight: 700,
    lineHeight: 1.1,
  },
};