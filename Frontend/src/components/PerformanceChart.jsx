import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const fallbackData = [
  { date: "03/01", value: 100 },
  { date: "03/05", value: 110 },
  { date: "03/10", value: 105 },
  { date: "03/15", value: 122 },
  { date: "03/20", value: 115 },
  { date: "03/25", value: 135 },
  { date: "03/30", value: 145 },
];

export default function PerformanceChart({ data }) {
  // 如果后端还没接 → 用假数据
  const chartData = data && data.length ? data : fallbackData;

  return (
    <section className="chart-card" style={styles.card}>
      <h2 style={styles.title}>Portfolio Performance</h2>

      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid stroke="#334155" strokeDasharray="3 3" />

            <XAxis
              dataKey="date"
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              axisLine={{ stroke: "#334155" }}
              tickLine={{ stroke: "#334155" }}
            />

            <YAxis
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              axisLine={{ stroke: "#334155" }}
              tickLine={{ stroke: "#334155" }}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                border: "1px solid #334155",
                borderRadius: "12px",
                color: "#e2e8f0",
              }}
              labelStyle={{ color: "#e2e8f0" }}
            />

            <Line
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ r: 4, fill: "#3b82f6" }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
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