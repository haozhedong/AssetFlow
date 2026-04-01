import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { useState } from "react";

const COLORS = ["#3b82f6", "#14b8a6", "#f59e0b", "#a855f7", "#ef4444"];

export default function AllocationChart({ data = [] }) {
  const [activeIndex, setActiveIndex] = useState(-1);

  const chartData = data.map((item) => ({
    name: item.groupValue,
    value: Number(item.marketValue ?? 0),
    weightPct: Number(item.weightPct ?? 0),
  }));

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(-1);
  };

  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="#cbd5e1"
        textAnchor="middle"
        dominantBaseline="central"
        style={{ fontSize: 11, fontWeight: 600 }}
      >
        {(percent * 100).toFixed(0)}%
      </text>
    );
  };

  if (!chartData.length) {
    return (
      <section style={styles.wrapper}>
        <h2 style={styles.title}>Asset Allocation</h2>
        <div style={styles.empty}>No allocation data</div>
      </section>
    );
  }

  return (
    <section style={styles.wrapper}>
      <h2 style={styles.title}>Asset Allocation</h2>

      <div style={styles.chartArea}>
        <div style={styles.chartBox}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                innerRadius={58}
                outerRadius={108}
                paddingAngle={1}
                label={renderLabel}
                onMouseLeave={onPieLeave}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={COLORS[index % COLORS.length]}
                    style={{
                      transform: index === activeIndex ? "scale(1.04)" : "scale(1)",
                      transformOrigin: "center",
                      transition: "transform 0.18s ease",
                      cursor: "pointer",
                    }}
                    onMouseEnter={() => onPieEnter(entry, index)}
                  />
                ))}
              </Pie>

              <Tooltip
                formatter={(value) => `$${Number(value).toLocaleString()}`}
                contentStyle={{
                  backgroundColor: "#08111f",
                  border: "1px solid rgba(148, 163, 184, 0.22)",
                  borderRadius: "0px",
                  color: "#e2e8f0",
                  fontSize: "12px",
                }}
                itemStyle={{
                  color: "#e2e8f0",
                }}
                labelStyle={{
                  color: "#94a3b8",
                }}
              />

              <Legend
                wrapperStyle={{
                  color: "#94a3b8",
                  fontSize: "12px",
                  paddingTop: "10px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}

const styles = {
  wrapper: {
    background: "transparent",
    border: "none",
    borderRadius: "0",
    padding: "0",
  },

  title: {
    margin: "0 0 12px 0",
    color: "#e5e7eb",
    fontSize: "16px",
    fontWeight: 700,
    letterSpacing: "0.02em",
  },

  chartArea: {
    paddingTop: "4px",
  },

  chartBox: {
    width: "100%",
    height: "320px",
    borderTop: "1px solid rgba(148, 163, 184, 0.18)",
    borderBottom: "1px solid rgba(148, 163, 184, 0.18)",
    padding: "16px 0 8px",
    background: "transparent",
  },

  empty: {
    color: "#94a3b8",
    padding: "12px 0",
    borderTop: "1px solid rgba(148, 163, 184, 0.18)",
    borderBottom: "1px solid rgba(148, 163, 184, 0.18)",
  },
};