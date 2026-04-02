import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = [
  "#3b82f6",
  "#14b8a6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#84cc16",
  "#f97316",
];

function normalizeAllocationData(data) {
  if (!Array.isArray(data)) return [];

  return data
      .filter((item) => item)
      .map((item) => ({
        name: String(
            item.groupValue || item.assetType || item.type || item.label || "OTHER"
        ).toUpperCase(),
        value: Number(item.weightPct ?? item.value ?? item.percentage ?? 0),
        marketValue: Number(item.marketValue ?? 0),
      }))
      .filter((item) => item.value > 0);
}

function renderLegendText(value) {
  return <span style={{ color: "#cbd5e1", fontSize: 13 }}>{value}</span>;
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;

  const item = payload[0]?.payload;
  if (!item) return null;

  return (
      <div
          style={{
            background: "#0f172a",
            border: "1px solid #334155",
            padding: "10px 12px",
            color: "#e2e8f0",
          }}
      >
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
          {item.name}
        </div>
        <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 4 }}>
          Allocation: {item.value.toFixed(2)}%
        </div>
        <div style={{ fontSize: 13, color: "#94a3b8" }}>
          Market Value: $
          {item.marketValue.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
      </div>
  );
}

export default function AllocationChart({ data }) {
  const chartData = normalizeAllocationData(data);

  if (!chartData.length) {
    return (
        <div
            style={{
              height: 360,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#94a3b8",
              fontSize: 14,
              borderTop: "1px solid rgba(148, 163, 184, 0.12)",
            }}
        >
          No allocation data available
        </div>
    );
  }

  return (
      <div
          style={{
            width: "100%",
            height: 360,
            borderTop: "1px solid rgba(148, 163, 184, 0.12)",
            paddingTop: 12,
          }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="43%"
                innerRadius={70}
                outerRadius={112}
                paddingAngle={1}
                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                labelLine={true}
            >
              {chartData.map((entry, index) => (
                  <Cell
                      key={`${entry.name}-${index}`}
                      fill={COLORS[index % COLORS.length]}
                  />
              ))}
            </Pie>

            <Tooltip content={<CustomTooltip />} />

            <Legend
                verticalAlign="bottom"
                align="center"
                iconType="square"
                iconSize={12}
                wrapperStyle={{ paddingTop: 8 }}
                formatter={renderLegendText}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
  );
}