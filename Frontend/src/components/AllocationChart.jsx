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
        fill="#e2e8f0"
        textAnchor="middle"
        dominantBaseline="central"
        style={{ fontSize: 12, fontWeight: 600 }}
      >
        {(percent * 100).toFixed(0)}%
      </text>
    );
  };

  if (!chartData.length) {
    return (
      <section style={styles.card}>
        <h2 style={styles.title}>Asset Allocation</h2>
        <div style={{ color: "#94a3b8" }}>No allocation data</div>
      </section>
    );
  }

  return (
    <section className="chart-card" style={styles.card}>
      <h2 style={styles.title}>Asset Allocation</h2>

      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              outerRadius={110}
              paddingAngle={2}
              label={renderLabel} 
              onMouseLeave={onPieLeave}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={entry.name}
                  fill={COLORS[index % COLORS.length]}
                  style={{
                    transform:
                      index === activeIndex ? "scale(1.08)" : "scale(1)",
                    transformOrigin: "center",
                    transition: "all 0.2s ease",
                    cursor: "pointer",
                  }}
                  onMouseEnter={() => onPieEnter(entry, index)}
                />
              ))}
            </Pie>

            <Tooltip
              formatter={(value) => `$${Number(value).toLocaleString()}`}
              contentStyle={{
                backgroundColor: "#0f172a",
                border: "1px solid #334155",
                borderRadius: "12px",
                color: "#e2e8f0",
              }}
            />

            <Legend
              wrapperStyle={{
                color: "#94a3b8",
                fontSize: "12px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
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
};