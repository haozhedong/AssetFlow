import { Link, useLocation } from "react-router-dom";

const items = [
  { name: "Dashboard", path: "/" },
  { name: "Holdings", path: "/holdings" },
  { name: "Transactions", path: "/transactions" },
  { name: "Analytics", path: "/analytics" },
  { name: "AI Insights", path: "/ai" },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside style={styles.sidebar}>
      <div style={styles.logo}>AssetFlow</div>

      <nav style={styles.menu}>
        {items.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <Link
                key={item.name}
                to={item.path}
                className="nav-link"
                style={{
                    ...styles.link,
                    ...(isActive ? styles.active : {}),
                }}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

const styles = {
  sidebar: {
    height: "100%",
    padding: "24px 16px",
    background: "#020617",
  },
  logo: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#e2e8f0",
    marginBottom: "28px",
  },
  menu: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  link: {
    textDecoration: "none",
    color: "#94a3b8",
    fontSize: "15px",
    fontWeight: 500,
    padding: "14px 16px",
    borderRadius: "12px",
    transition: "all 0.2s ease",
  },
  active: {
    background: "rgba(59,130,246,0.15)",
    color: "#3b82f6",
    fontWeight: 700,
    boxShadow: "inset 3px 0 0 #3b82f6", // 左侧蓝条（很金融风）
  },
};