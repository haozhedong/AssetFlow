import { useState } from "react";
import AiPortfolioDoctor from "../components/AiPortfolioDoctor";
import AiChatBox from "../components/AiChatBox";

export default function AIInsights() {
  return (
      <div style={styles.page}>
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <div>
              <h1 style={styles.title}>AI Insights</h1>
              <p style={styles.subtitle}>Get intelligent analysis and personalized recommendations</p>
            </div>
          </div>

          <div style={styles.twoColumnLayout}>
            {/* Left Column - Portfolio Doctor */}
            <div style={styles.leftColumn}>
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <h2 style={styles.cardTitle}>Portfolio Doctor</h2>
                  <span style={styles.badge}>AI POWERED</span>
                </div>
                <div style={styles.cardContent}>
                  <AiPortfolioDoctor />
                </div>
              </div>
            </div>

            {/* Right Column - AI Chat */}
            <div style={styles.rightColumn}>
              <div style={styles.chatCard}>
                <AiChatBox />
              </div>
            </div>
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
    padding: "32px 24px",
    maxWidth: "1600px",
    margin: "0 auto",
  },

  sectionHeader: {
    marginBottom: "32px",
  },

  title: {
    margin: "0 0 8px 0",
    fontSize: "36px",
    fontWeight: 700,
    color: "#f8fafc",
    lineHeight: 1.1,
    letterSpacing: "-0.02em",
  },

  subtitle: {
    margin: "0",
    fontSize: "15px",
    color: "#94a3b8",
    fontWeight: 400,
    lineHeight: 1.6,
  },

  twoColumnLayout: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "24px",
    alignItems: "flex-start",
  },

  leftColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },

  rightColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },

  card: {
    backgroundColor: "transparent",
    borderRadius: "12px",
    overflow: "hidden",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
    gap: "12px",
    flexWrap: "wrap",
  },

  cardTitle: {
    margin: "0",
    fontSize: "18px",
    fontWeight: 700,
    color: "#f0f4f8",
    lineHeight: 1.3,
  },

  badge: {
    display: "inline-block",
    padding: "6px 12px",
    backgroundColor: "rgba(59, 130, 246, 0.12)",
    color: "#60a5fa",
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    borderRadius: "4px",
    border: "1px solid rgba(59, 130, 246, 0.25)",
    whiteSpace: "nowrap",
  },

  cardContent: {
    paddingTop: "8px",
  },

  chatCard: {
    backgroundColor: "transparent",
    borderRadius: "12px",
    overflow: "hidden",
  },

  // Responsive design
  "@media (max-width: 1200px)": {
    twoColumnLayout: {
      gridTemplateColumns: "1fr",
    },
  },

  "@media (max-width: 768px)": {
    section: {
      padding: "24px 16px",
    },

    title: {
      fontSize: "28px",
    },

    subtitle: {
      fontSize: "14px",
    },

    twoColumnLayout: {
      gridTemplateColumns: "1fr",
      gap: "20px",
    },
  },
};