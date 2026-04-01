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

function getTemperatureColor(temp) {
  if (temp >= 32) return "#ea580c";
  if (temp >= 26) return "#16a34a";
  if (temp >= 18) return "#0284c7";
  return "#2563eb";
}

function getWeatherIcon(code) {
  const commonProps = { size: 20, strokeWidth: 2.2 };

  if (code === 0) return <Sun {...commonProps} color="#eab308" />;
  if ([1, 2].includes(code)) return <Cloud {...commonProps} color="#64748b" />;
  if (code === 3) return <Cloud {...commonProps} color="#475569" />;
  if ([45, 48].includes(code)) return <CloudFog {...commonProps} color="#64748b" />;
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) {
    return <CloudRain {...commonProps} color="#0284c7" />;
  }
  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return <CloudSnow {...commonProps} color="#60a5fa" />;
  }
  if ([95, 96, 99].includes(code)) {
    return <CloudLightning {...commonProps} color="#eab308" />;
  }

  return <Cloud {...commonProps} color="#64748b" />;
}

function getBestCityName(geoData, fallback = "Local") {
  if (!geoData) return fallback;

  return (
    geoData.city ||
    geoData.locality ||
    geoData.principalSubdivision ||
    geoData.localityInfo?.administrative?.[0]?.name ||
    fallback
  );
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState(null);
  const [city, setCity] = useState("Locating...");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchWeatherAndCity(lat, lon, fallbackCity = "Local") {
      try {
        const weatherUrl =
          `https://api.open-meteo.com/v1/forecast` +
          `?latitude=${lat}` +
          `&longitude=${lon}` +
          `&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,relative_humidity_2m` +
          `&timezone=auto`;

        const cityUrl =
          `https://api-bdc.net/data/reverse-geocode-client` +
          `?latitude=${lat}` +
          `&longitude=${lon}` +
          `&localityLanguage=en`;

        const [weatherRes, cityRes] = await Promise.all([
          fetch(weatherUrl),
          fetch(cityUrl),
        ]);

        if (!weatherRes.ok) {
          throw new Error("Weather request failed");
        }

        const weatherData = await weatherRes.json();

        let cityName = fallbackCity;

        if (cityRes.ok) {
          const cityData = await cityRes.json();
          cityName = getBestCityName(cityData, fallbackCity);
        }

        if (!cancelled) {
          setWeather(weatherData.current);
          setCity(cityName);
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError("Unable to load weather");
          setLoading(false);
        }
      }
    }

    if (!navigator.geolocation) {
      fetchWeatherAndCity(1.3521, 103.8198, "Singapore");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        fetchWeatherAndCity(lat, lon, "Local");
      },
      () => {
        fetchWeatherAndCity(1.3521, 103.8198, "Singapore");
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
        <div style={styles.grid}>
          <div style={styles.item}>
            <div style={styles.label}>Condition</div>
            <div style={styles.valuePrimary}>Loading weather...</div>
          </div>

          <div style={styles.item}>
            <div style={styles.label}>Temperature</div>
            <div style={styles.valueNeutral}>--</div>
          </div>

          <div style={styles.item}>
            <div style={styles.label}>Feels Like</div>
            <div style={styles.valueNeutral}>--</div>
          </div>

          <div style={styles.item}>
            <div style={styles.label}>Humidity</div>
            <div style={styles.valueNeutral}>--</div>
          </div>

          <div style={styles.itemNoBorder}>
            <div style={styles.label}>Wind</div>
            <div style={styles.valueNeutral}>--</div>
          </div>
        </div>
      </section>
    );
  }

  if (error || !weather) {
    return (
      <section style={styles.section}>
        <div style={styles.grid}>
          <div style={styles.item}>
            <div style={styles.label}>Condition</div>
            <div style={styles.valuePrimary}>{error || "Weather unavailable"}</div>
          </div>

          <div style={styles.item}>
            <div style={styles.label}>Temperature</div>
            <div style={styles.valueNeutral}>--</div>
          </div>

          <div style={styles.item}>
            <div style={styles.label}>Feels Like</div>
            <div style={styles.valueNeutral}>--</div>
          </div>

          <div style={styles.item}>
            <div style={styles.label}>Humidity</div>
            <div style={styles.valueNeutral}>--</div>
          </div>

          <div style={styles.itemNoBorder}>
            <div style={styles.label}>Wind</div>
            <div style={styles.valueNeutral}>--</div>
          </div>
        </div>
      </section>
    );
  }

  const tempColor = getTemperatureColor(Number(weather.temperature_2m ?? 0));
  const feelsLikeColor = getTemperatureColor(
    Number(weather.apparent_temperature ?? 0)
  );

  return (
    <section style={styles.section}>
      <div style={styles.grid}>
        <div style={styles.item}>
          <div style={styles.label}>Condition</div>
          <div style={styles.conditionRow}>
            <span style={styles.city}>{city}</span>
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
    padding: "6px 0",
    background: "#1e293b",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1.9fr 1fr 1fr 1fr 1fr",
    background: "#1e293b ",
  },

  item: {
    padding: "10px 14px",
    borderRight: "1px solid #e2e8f0",
    minWidth: 0,
    background: "transparent",
  },

  itemNoBorder: {
    padding: "10px 14px",
    minWidth: 0,
    background: "transparent",
  },

  label: {
    fontSize: "10px",
    color: "#64748b",
    marginBottom: "4px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    fontWeight: 600,
  },

  conditionRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    minWidth: 0,
    flexWrap: "wrap",
  },

  city: {
    fontSize: "12px",
    fontWeight: 600,
    color: "#64748b",
    marginRight: "4px",
    letterSpacing: "0.01em",
  },

  iconWrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "24px",
    height: "24px",
    flexShrink: 0,
  },

  valuePrimary: {
    fontSize: "16px",
    fontWeight: 600,
    color: "#ffffff",
    lineHeight: 1.2,
    wordBreak: "break-word",
  },

  value: {
    fontSize: "18px",
    fontWeight: 600,
    lineHeight: 1.1,
  },

  valueNeutral: {
    fontSize: "18px",
    fontWeight: 600,
    color: "#ffffff",
    lineHeight: 1.1,
  },
};