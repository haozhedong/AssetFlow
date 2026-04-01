import { useEffect, useState } from "react";
import { getDashboardOverview } from "../api/dashboardApi";

import KpiCards from "../components/KpiCards";
import AllocationChart from "../components/AllocationChart";
import PerformanceChart from "../components/PerformanceChart";
import HoldingsTable from "../components/HoldingsTable";
import slogan from "../assets/slogan.png";
import WeatherWidget from "../components/WeatherWidget";

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const data = await getDashboardOverview();
        console.log("dashboard overview:", data);
        setDashboardData(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.main}>
          <div style={styles.statusBox}>Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.page}>
        <div style={styles.main}>
          <div style={{ ...styles.statusBox, ...styles.errorBox }}>{error}</div>
        </div>
      </div>
    );
  }

  const portfolioValue = dashboardData?.totalValue ?? "$128,450.20";
  const dailyPnl = dashboardData?.dailyPnl ?? "+2.14%";
  const userName = "Haozhe";

  const newsItems = [
    {
      id: 1,
      category: "Markets",
      time: "5 min ago",
      title: "US equities extend gains as investors rotate into large-cap tech",
      summary:
        "Mega-cap stocks led the session higher while Treasury yields stayed relatively stable.",
    },
    {
      id: 2,
      category: "Economy",
      time: "18 min ago",
      title: "Fed officials signal patience as inflation data remains mixed",
      summary:
        "Markets are reassessing the rate path after policymakers reiterated a data-dependent stance.",
    },
    {
      id: 3,
      category: "Commodities",
      time: "34 min ago",
      title: "Oil edges higher on renewed supply concerns in the Middle East",
      summary:
        "Crude prices moved up amid supply uncertainty, with energy names outperforming in early trade.",
    },
    {
      id: 4,
      category: "AI",
      time: "52 min ago",
      title: "Semiconductor shares rally as AI infrastructure demand remains strong",
      summary:
        "Chipmakers and cloud names outperformed after fresh optimism around enterprise AI spending.",
    },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.main}>
        <section style={styles.topBar}>
          <div style={styles.topBarLeft}>
            <span style={styles.liveDot}></span>
            <span style={styles.topBarLabel}>Portfolio Terminal</span>
          </div>

          <div style={styles.marketTicker}>
            <span style={styles.tickerItem}>
              S&amp;P 500 <span style={styles.positive}>+2.91%</span>
            </span>
            <span style={styles.tickerDivider}>|</span>
            <span style={styles.tickerItem}>
              Nasdaq <span style={styles.positive}>+3.83%</span>
            </span>
            <span style={styles.tickerDivider}>|</span>
            <span style={styles.tickerItem}>
              BTC <span style={styles.positive}>+2.96%</span>
            </span>
            <span style={styles.tickerDivider}>|</span>
            <span style={styles.tickerItem}>
              US 10Y <span style={styles.neutral}>0.00%</span>
            </span>
          </div>
        </section>

        <section style={styles.heroSection}>
          <div style={styles.heroLeft}>
            <p style={styles.overline}>PORTFOLIO DASHBOARD</p>
            <h1 style={styles.heroTitle}>Welcome back, {userName}</h1>
            <p style={styles.heroSubtitle}>
              Track your holdings, allocation, performance, and market context in one place.
            </p>
          </div>

          <div style={styles.heroRight}>
            <div style={styles.inlineMetric}>
              <span style={styles.inlineMetricLabel}>Portfolio Value</span>
              <span style={styles.inlineMetricValue}>{portfolioValue}</span>
            </div>

            <div style={styles.inlineMetric}>
              <span style={styles.inlineMetricLabel}>Today</span>
              <span
                style={{
                  ...styles.inlineMetricValue,
                  color: String(dailyPnl).includes("-") ? "#ef4444" : "#22c55e",
                }}
              >
                {dailyPnl}
              </span>
            </div>
          </div>
        </section>

        <WeatherWidget />

        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Key Metrics</h2>
            <span style={styles.sectionMeta}>Live Overview</span>
          </div>

          <div style={styles.contentBlock}>
            <KpiCards data={dashboardData} />
          </div>
        </section>





        <section style={styles.twoColumnSection}>
          <div style={styles.columnPanelLeft}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Asset Allocation</h2>
              <span style={styles.sectionMeta}>Diversification breakdown</span>
            </div>

            <div style={styles.contentBlock}>
              <AllocationChart data={dashboardData?.allocation || []} />
            </div>
          </div>

          <div style={styles.columnPanelRight}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Performance</h2>
              <span style={styles.sectionMeta}>Portfolio trend over time</span>
            </div>

            <div style={styles.contentBlock}>
              <PerformanceChart data={dashboardData?.performance || []} />
            </div>
          </div>
        </section>

        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Top Holdings</h2>
            <span style={styles.sectionMeta}>Largest positions in your portfolio</span>
          </div>

          <div style={styles.contentBlock}>
            <HoldingsTable data={dashboardData?.topHoldings || []} />
          </div>
        </section>

        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Market News</h2>
            <span style={styles.sectionMeta}>Latest developments affecting markets</span>
          </div>

          <div style={styles.newsList}>
            {newsItems.map((item, index) => (
              <article
                key={item.id}
                style={{
                  ...styles.newsRow,
                  borderBottom:
                    index === newsItems.length - 1
                      ? "none"
                      : "1px solid rgba(148, 163, 184, 0.12)",
                }}
              >
                <div style={styles.newsMetaColumn}>
                  <span style={styles.newsCategory}>{item.category}</span>
                  <span style={styles.newsTime}>{item.time}</span>
                </div>

                <div style={styles.newsContentColumn}>
                  <h3 style={styles.newsTitle}>{item.title}</h3>
                  <p style={styles.newsSummary}>{item.summary}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section style={styles.sloganSection}>
          <img src={slogan} alt="Trust and Believe" style={styles.sloganImage} />
        </section>
      </div>
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

  main: {
    width: "100%",
    maxWidth: "1600px",
    margin: "0 auto",
    padding: "0 24px 40px",
    boxSizing: "border-box",
  },

  topBar: {
    height: "52px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid rgba(148, 163, 184, 0.18)",
    color: "#f8fafc",
    overflow: "hidden",
    gap: "16px",
  },

  topBarLeft: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    minWidth: "fit-content",
  },

  liveDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#ef4444",
    display: "inline-block",
  },

  topBarLabel: {
    fontSize: "14px",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },

  marketTicker: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    whiteSpace: "nowrap",
    overflowX: "auto",
    scrollbarWidth: "none",
    msOverflowStyle: "none",
    flex: 1,
    justifyContent: "flex-end",
  },

  tickerItem: {
    fontSize: "14px",
    color: "#e5e7eb",
    fontWeight: 500,
  },

  tickerDivider: {
    color: "rgba(148, 163, 184, 0.45)",
  },

  positive: {
    color: "#22c55e",
    fontWeight: 700,
    marginLeft: "6px",
  },

  neutral: {
    color: "#cbd5e1",
    fontWeight: 700,
    marginLeft: "6px",
  },

  heroSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: "24px",
    padding: "24px 0 20px",
    borderBottom: "1px solid rgba(148, 163, 184, 0.18)",
    flexWrap: "wrap",
  },

  heroLeft: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  overline: {
    margin: 0,
    fontSize: "12px",
    letterSpacing: "0.14em",
    color: "#60a5fa",
    fontWeight: 700,
  },

  heroTitle: {
    margin: 0,
    fontSize: "48px",
    lineHeight: 1.05,
    fontWeight: 700,
    color: "#f8fafc",
  },

  heroSubtitle: {
    margin: 0,
    fontSize: "16px",
    lineHeight: 1.5,
    color: "#94a3b8",
    maxWidth: "700px",
  },

  heroRight: {
    display: "flex",
    alignItems: "stretch",
    gap: "24px",
    flexWrap: "wrap",
  },

  inlineMetric: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    minWidth: "180px",
    paddingLeft: "24px",
    borderLeft: "1px solid rgba(148, 163, 184, 0.18)",
  },

  inlineMetricLabel: {
    fontSize: "13px",
    color: "#94a3b8",
    marginBottom: "8px",
  },

  inlineMetricValue: {
    fontSize: "22px",
    fontWeight: 700,
    color: "#f8fafc",
  },

  section: {
    padding: "18px 0",
    borderBottom: "1px solid rgba(148, 163, 184, 0.18)",
  },

  twoColumnSection: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    borderBottom: "1px solid rgba(148, 163, 184, 0.18)",
  },

  columnPanelLeft: {
    padding: "18px 24px 18px 0",
    borderRight: "1px solid rgba(148, 163, 184, 0.18)",
    minWidth: 0,
  },

  columnPanelRight: {
    padding: "18px 0 18px 24px",
    minWidth: 0,
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    marginBottom: "14px",
    flexWrap: "wrap",
  },

  sectionTitle: {
    margin: 0,
    fontSize: "22px",
    fontWeight: 700,
    color: "#f8fafc",
    lineHeight: 1.1,
  },

  sectionMeta: {
    fontSize: "13px",
    color: "#94a3b8",
    whiteSpace: "nowrap",
  },

  contentBlock: {
    paddingTop: "8px",
  },

  newsList: {
    display: "flex",
    flexDirection: "column",
    borderTop: "1px solid rgba(148, 163, 184, 0.12)",
    marginTop: "8px",
  },

  newsRow: {
    display: "grid",
    gridTemplateColumns: "180px 1fr",
    gap: "20px",
    padding: "16px 0",
    alignItems: "start",
  },

  newsMetaColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },

  newsCategory: {
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#60a5fa",
  },

  newsTime: {
    fontSize: "13px",
    color: "#94a3b8",
  },

  newsContentColumn: {
    minWidth: 0,
  },

  newsTitle: {
    margin: "0 0 8px 0",
    fontSize: "20px",
    lineHeight: 1.3,
    fontWeight: 700,
    color: "#f8fafc",
  },

  newsSummary: {
    margin: 0,
    fontSize: "14px",
    lineHeight: 1.6,
    color: "#94a3b8",
    maxWidth: "980px",
  },

  sloganSection: {
    marginTop: "28px",
    paddingTop: "20px",
    borderTop: "1px solid rgba(148, 163, 184, 0.18)",
  },

  sloganImage: {
    width: "100%",
    height: "auto",
    display: "block",
    opacity: 0.92,
    filter: "brightness(0.9) contrast(1.05)",
  },

  statusBox: {
    marginTop: "80px",
    padding: "20px 0",
    borderTop: "1px solid rgba(148, 163, 184, 0.18)",
    borderBottom: "1px solid rgba(148, 163, 184, 0.18)",
    color: "#cbd5e1",
    fontSize: "15px",
  },

  errorBox: {
    color: "#fca5a5",
    borderTop: "1px solid rgba(239, 68, 68, 0.35)",
    borderBottom: "1px solid rgba(239, 68, 68, 0.35)",
  },
};