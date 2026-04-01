import { useEffect, useState } from "react";

const DEFAULT_ITEMS = [
  { label: "AAPL", symbol: "AAPL" },
  { label: "MSFT", symbol: "MSFT" },
  { label: "NVDA", symbol: "NVDA" },
  { label: "AMZN", symbol: "AMZN" },
  { label: "GOOGL", symbol: "GOOGL" },
  { label: "META", symbol: "META" },
  { label: "TSLA", symbol: "TSLA" },
  { label: "NFLX", symbol: "NFLX" },
  { label: "AMD", symbol: "AMD" },
  { label: "INTC", symbol: "INTC" },
  { label: "AVGO", symbol: "AVGO" },
  { label: "QCOM", symbol: "QCOM" },
  { label: "ADBE", symbol: "ADBE" },
  { label: "CRM", symbol: "CRM" },
  { label: "ORCL", symbol: "ORCL" },
];

function formatPercent(value) {
  const num = Number(value ?? 0);
  const abs = Math.abs(num);
  const sign = num > 0 ? "+" : num < 0 ? "-" : "";
  return `${sign}${abs.toFixed(2)}%`;
}

function formatPrice(value, symbol) {
  const num = Number(value ?? 0);

  if (symbol.includes("BINANCE:")) {
    if (num >= 1000) {
      return `$${num.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    }
    return `$${num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  if (num >= 1000) {
    return `$${num.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  }

  return `$${num.toFixed(2)}`;
}

function getChangeColor(changePct) {
  const num = Number(changePct ?? 0);
  if (num > 0) return "#22c55e";
  if (num < 0) return "#ef4444";
  return "#e2e8f0";
}

function getArrow(changePct) {
  const num = Number(changePct ?? 0);
  if (num > 0) return "▲";
  if (num < 0) return "▼";
  return "•";
}

export default function MarketTicker() {
  const [items, setItems] = useState(
    DEFAULT_ITEMS.map((item) => ({
      ...item,
      price: 0,
      percent: 0,
      loading: true,
    }))
  );

  const apiKey = import.meta.env.VITE_FINNHUB_API_KEY;

  useEffect(() => {
    if (!apiKey) {
      console.error("Missing VITE_FINNHUB_API_KEY");
      setItems(
        DEFAULT_ITEMS.map((item) => ({
          ...item,
          price: 0,
          percent: 0,
          loading: false,
        }))
      );
      return;
    }

    let cancelled = false;

    async function fetchQuote(item) {
      try {
        const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(
          item.symbol
        )}&token=${apiKey}`;

        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`Failed quote for ${item.symbol}`);
        }

        const data = await res.json();

        return {
          ...item,
          price: Number(data.c ?? 0),
          percent: Number(data.dp ?? 0),
          loading: false,
        };
      } catch (error) {
        console.error(error);
        return {
          ...item,
          price: 0,
          percent: 0,
          loading: false,
        };
      }
    }

    async function loadAll() {
      const results = await Promise.all(DEFAULT_ITEMS.map(fetchQuote));
      if (!cancelled) {
        setItems(results);
      }
    }

    loadAll();
    const timer = setInterval(loadAll, 15000);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [apiKey]);

  function renderTickerItem(item, index, prefix = "group") {
    const color = getChangeColor(item.percent);
    const arrow = getArrow(item.percent);

    return (
      <div key={`${prefix}-${item.symbol}-${index}`} style={styles.item}>
        <span style={styles.label}>{item.label}</span>

        <span style={styles.price}>
          {item.loading ? "--" : formatPrice(item.price, item.symbol)}
        </span>

        <span style={{ ...styles.arrow, color }}>
          {item.loading ? "" : arrow}
        </span>

        <span style={{ ...styles.change, color }}>
          {item.loading ? "--" : formatPercent(item.percent)}
        </span>

        <span style={styles.divider}>|</span>
      </div>
    );
  }

  return (
    <section style={styles.section}>
      <div style={styles.track} className="market-ticker-track">
        <div style={styles.fadeLeft}></div>
        <div style={styles.fadeRight}></div>

        <div style={styles.marquee} className="market-ticker-marquee">
          <div style={styles.group}>
            {items.map((item, index) => renderTickerItem(item, index, "first"))}
          </div>

          <div style={styles.group}>
            {items.map((item, index) => renderTickerItem(item, index, "second"))}
          </div>
        </div>
      </div>
    </section>
  );
}

const styles = {
  section: {
    padding: "8px 0",
    overflow: "hidden",
    background: "#1e293b",
    borderTop: "1px solid #334155",
    borderBottom: "1px solid #334155",
  },

  track: {
    overflow: "hidden",
    width: "100%",
    position: "relative",
    background: "#1e293b",
    cursor: "pointer",
  },

  fadeLeft: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: "72px",
    zIndex: 2,
    pointerEvents: "none",
    background:
      "linear-gradient(90deg, #1e293b 0%, rgba(30,41,59,0.92) 35%, rgba(30,41,59,0) 100%)",
  },

  fadeRight: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: "72px",
    zIndex: 2,
    pointerEvents: "none",
    background:
      "linear-gradient(270deg, #1e293b 0%, rgba(30,41,59,0.92) 35%, rgba(30,41,59,0) 100%)",
  },

  marquee: {
    display: "flex",
    width: "max-content",
    padding: "10px 0",
  },

  group: {
    display: "flex",
    alignItems: "center",
    gap: "28px",
    flexShrink: 0,
    paddingRight: "28px",
  },

  item: {
    display: "inline-flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "15px",
    fontWeight: 600,
    color: "#e2e8f0",
    whiteSpace: "nowrap",
  },

  label: {
    color: "#e2e8f0",
    fontWeight: 700,
    letterSpacing: "0.02em",
  },

  price: {
    color: "#cbd5e1",
    fontWeight: 600,
  },

  arrow: {
    fontSize: "12px",
    fontWeight: 700,
    lineHeight: 1,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "10px",
  },

  change: {
    fontWeight: 700,
  },

  divider: {
    color: "#475569",
    marginLeft: "6px",
  },
};