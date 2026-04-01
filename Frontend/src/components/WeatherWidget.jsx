import { useEffect, useState } from "react";
import {
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudFog,
} from "lucide-react";

function getWeatherLabel(code) {
  const map = {
    0: "Clear",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Rime fog",
    51: "Light drizzle",
    53: "Drizzle",
    55: "Dense drizzle",
    56: "Freezing drizzle",
    57: "Heavy freezing drizzle",
    61: "Light rain",
    63: "Rain",
    65: "Heavy rain",
    66: "Freezing rain",
    67: "Heavy freezing rain",
    71: "Light snow",
    73: "Snow",
    75: "Heavy snow",
    77: "Snow grains",
    80: "Rain showers",
    81: "Heavy rain showers",
    82: "Violent rain showers",
    85: "Snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with hail",
    99: "Severe thunderstorm with hail",
  };

  return map[code] || "Unknown";
}

function getWeatherIcon(code) {
  if (code === 0) return <Sun size={28} color="#facc15" strokeWidth={2.2} />;

  if ([1, 2].includes(code)) {
    return <Cloud size={28} color="#cbd5e1" strokeWidth={2.2} />;
  }

  if (code === 3) {
    return <Cloud size={28} color="#94a3b8" strokeWidth={2.2} />;
  }

  if ([45, 48].includes(code)) {
    return <CloudFog size={28} color="#94a3b8" strokeWidth={2.2} />;
  }

  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) {
    return <CloudRain size={28} color="#38bdf8" strokeWidth={2.2} />;
  }

  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return <CloudSnow size={28} color="#e0f2fe" strokeWidth={2.2} />;
  }

  if ([95, 96, 99].includes(code)) {
    return <CloudLightning size={28} color="#facc15" strokeWidth={2.2} />;
  }

  return <Cloud size={28} color="#cbd5e1" strokeWidth={2.2} />;
}

function getTemperatureColor(temp) {
  if (temp >= 32) return "#f97316";
  if (temp >= 26) return "#22c55e";
  if (temp >= 18) return "#38bdf8";
  return "#60a5fa";
}

function formatLocationLabel(lat, lon) {
  return `${Number(lat).toFixed(2)}, ${Number(lon).toFixed(2)}`;
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState(null);
  const [locationLabel, setLocationLabel] = useState("Detecting location...");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchWeather(lat, lon, label) {
      try {
        const url =
          `https://api.open-meteo.com/v1/forecast` +
          `?latitude=${lat}` +
          `&longitude=${lon}` +
          `&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,relative_humidity_2m` +
          `&timezone=auto`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("Weather request failed");
        }

        const data = await response.json();

        if (!cancelled) {
          setWeather(data.current);
          setLocationLabel(label || formatLocationLabel(lat, lon));
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError("Unable to load weather");
          setLoading(false);
        }
      }
    }

    if (!navigator.geolocation) {
      fetchWeather(1.3521, 103.8198, "Singapore");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        fetchWeather(lat, lon, formatLocationLabel(lat, lon));
      },
      () => {
        fetchWeather(1.3521, 103.8198, "Singapore");
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 300000,
      }
    );

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <section style={styles.section}>
        <div style={styles.headerRow}>
          <h3 style={styles.title}>Current Weather</h3>
          <span style={styles.meta}>Live conditions</span>
        </div>

        <div style={styles.loadingRow}>Loading weather...</div>
      </section>
    );
  }

  if (error || !weather) {
    return (
      <section style={styles.section}>
        <div style={styles.headerRow}>
          <h3 style={styles.title}>Current Weather</h3>
          <span style={styles.meta}>Live conditions</span>
        </div>

        <div style={styles.loadingRow}>{error || "Weather unavailable"}</div>
      </section>
    );
  }

  const tempColor = getTemperatureColor(Number(weather.temperature_2m ?? 0));
  const feelsLikeColor = getTemperatureColor(Number(weather.apparent_temperature ?? 0));

  return (
    <section style={styles.section}>
      <div style={styles.headerRow}>
        <h3 style={styles.title}>Current Weather</h3>
        <span style={styles.meta}>{locationLabel}</span>
      </div>

      <div style={styles.grid}>
        <div style={styles.item}>
          <div style={styles.label}>Condition</div>
          <div style={styles.conditionRow}>
            <div style={styles.iconWrap}>{getWeatherIcon(weather.weather_code)}</div>
            <div style={styles.valuePrimary}>
              {getWeatherLabel(weather.weather_code)}
            </div>
          </div>
        </div>

        <div style={styles.item}>
          <div style={styles.label}>Temperature</div>
          <div style={{ ...styles.value, color: tempColor }}>
            {Math.round(weather.temperature_2m)}°C
          </div>
        </div>

        <div style={styles.item}>
          <div style={styles.label}>Feels Like</div>
          <div style={{ ...styles.value, color: feelsLikeColor }}>
            {Math.round(weather.apparent_temperature)}°C
          </div>
        </div>

        <div style={styles.item}>
          <div style={styles.label}>Humidity</div>
          <div style={styles.valueNeutral}>
            {weather.relative_humidity_2m}%
          </div>
        </div>

        <div style={styles.itemNoBorder}>
          <div style={styles.label}>Wind</div>
          <div style={styles.valueNeutral}>
            {Math.round(weather.wind_speed_10m)} km/h
          </div>
        </div>
      </div>
    </section>
  );
}

const styles = {
  section: {
    padding: "18px 0",
    borderBottom: "1px solid rgba(148, 163, 184, 0.18)",
  },

  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    marginBottom: "12px",
    flexWrap: "wrap",
  },

  title: {
    margin: 0,
    fontSize: "22px",
    fontWeight: 700,
    color: "#f8fafc",
    lineHeight: 1.1,
  },

  meta: {
    fontSize: "13px",
    color: "#94a3b8",
    whiteSpace: "nowrap",
  },

  loadingRow: {
    padding: "14px 0",
    borderTop: "1px solid rgba(148, 163, 184, 0.18)",
    borderBottom: "1px solid rgba(148, 163, 184, 0.18)",
    color: "#94a3b8",
    fontSize: "14px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1.4fr 1fr 1fr 1fr 1fr",
    borderTop: "1px solid rgba(148, 163, 184, 0.18)",
    borderBottom: "1px solid rgba(148, 163, 184, 0.18)",
  },

  item: {
    padding: "16px 18px",
    borderRight: "1px solid rgba(148, 163, 184, 0.18)",
    minWidth: 0,
    background: "transparent",
  },

  itemNoBorder: {
    padding: "16px 18px",
    minWidth: 0,
    background: "transparent",
  },

  label: {
    fontSize: "12px",
    color: "#94a3b8",
    marginBottom: "8px",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },

  conditionRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    minWidth: 0,
  },

  iconWrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "34px",
    height: "34px",
    flexShrink: 0,
  },

  valuePrimary: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#e5e7eb",
    lineHeight: 1.2,
    wordBreak: "break-word",
  },

  value: {
    fontSize: "24px",
    fontWeight: 700,
    lineHeight: 1.1,
  },

  valueNeutral: {
    fontSize: "24px",
    fontWeight: 700,
    color: "#e5e7eb",
    lineHeight: 1.1,
  },
};