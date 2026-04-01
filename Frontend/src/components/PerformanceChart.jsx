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
  const chartData = data && data.length ? data : fallbackData;

  return (
    <section style={styles.wrapper}>
      <h2 style={styles.title}>Portfolio Performance</h2>

      <div style={styles.chartBox}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid
              stroke="rgba(148, 163, 184, 0.18)"
              strokeDasharray="3 3"
              vertical={true}
              horizontal={true}
            />

            <XAxis
              dataKey="date"
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              axisLine={{ stroke: "rgba(148, 163, 184, 0.18)" }}
              tickLine={{ stroke: "rgba(148, 163, 184, 0.18)" }}
            />

            <YAxis
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              axisLine={{ stroke: "rgba(148, 163, 184, 0.18)" }}
              tickLine={{ stroke: "rgba(148, 163, 184, 0.18)" }}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "#08111f",
                border: "1px solid rgba(148, 163, 184, 0.22)",
                borderRadius: "0px",
                color: "#e2e8f0",
                fontSize: "12px",
              }}
              labelStyle={{ color: "#e2e8f0" }}
              itemStyle={{ color: "#e2e8f0" }}
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

  chartBox: {
    width: "100%",
    height: "320px",
    borderTop: "1px solid rgba(148, 163, 184, 0.18)",
    borderBottom: "1px solid rgba(148, 163, 184, 0.18)",
    padding: "16px 0 8px",
    background: "transparent",
  },
};