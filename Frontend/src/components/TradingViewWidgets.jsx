import React, { useEffect, useRef, memo } from "react";

function createWidget(container, scriptSrc, config) {
    if (!container) return;

    container.innerHTML = "";

    const widget = document.createElement("div");
    widget.className = "tradingview-widget-container__widget";

    const copyright = document.createElement("div");
    copyright.className = "tradingview-widget-copyright";
    copyright.innerHTML = `
    <a
      href="https://www.tradingview.com/"
      rel="noopener nofollow"
      target="_blank"
    >
      <span class="blue-text">Track all markets on TradingView</span>
    </a>
  `;

    const script = document.createElement("script");
    script.src = scriptSrc;
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify(config);

    container.appendChild(widget);
    container.appendChild(copyright);
    container.appendChild(script);
}

function TradingViewWidgets() {
    const leftRef = useRef(null);
    const rightRef = useRef(null);
    const initializedRef = useRef(false);

    useEffect(() => {
        if (initializedRef.current) return;
        initializedRef.current = true;

        createWidget(
            leftRef.current,
            "https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js",
            {
                symbols: [
                    ["S&P 500", "FOREXCOM:SPXUSD"],
                    ["Nasdaq 100", "NASDAQ:NDX"],
                    ["Dow 30", "BLACKBULL:US30"]
                ],
                chartOnly: false,
                width: "100%",
                height: "100%",
                locale: "en",
                colorTheme: "dark",
                autosize: true,
                showVolume: false,
                showMA: false,
                hideDateRanges: false,
                hideMarketStatus: false,
                hideSymbolLogo: false,
                scalePosition: "right",
                scaleMode: "Normal",
                fontFamily:
                    "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
                fontSize: "12",
                valuesTracking: "1",
                changeMode: "price-and-percent",
                chartType: "area",
                lineWidth: 2,
                dateRanges: ["1d|1", "1m|30", "3m|60", "12m|1D", "60m|1W", "all|1M"],
                upColor: "#10b981",
                downColor: "#ef4444",
                borderUpColor: "#10b981",
                borderDownColor: "#ef4444",
                wickUpColor: "#10b981",
                wickDownColor: "#ef4444"
            }
        );

        createWidget(
            rightRef.current,
            "https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js",
            {
                colorTheme: "dark",
                dateRange: "12M",
                locale: "en",
                largeChartUrl: "",
                isTransparent: true,
                showFloatingTooltip: false,
                plotLineColorGrowing: "rgba(16, 185, 129, 1)",
                plotLineColorFalling: "rgba(239, 68, 68, 1)",
                gridLineColor: "rgba(148, 163, 184, 0.08)",
                scaleFontColor: "rgba(226, 232, 240, 0.85)",
                belowLineFillColorGrowing: "rgba(16, 185, 129, 0.10)",
                belowLineFillColorFalling: "rgba(239, 68, 68, 0.10)",
                belowLineFillColorGrowingBottom: "rgba(16, 185, 129, 0.02)",
                belowLineFillColorFallingBottom: "rgba(239, 68, 68, 0.02)",
                symbolActiveColor: "rgba(59, 130, 246, 0.14)",
                tabs: [
                    {
                        title: "Indices",
                        symbols: [
                            { s: "FOREXCOM:SPXUSD", d: "S&P 500" },
                            { s: "NASDAQ:NDX", d: "Nasdaq 100" },
                            { s: "BLACKBULL:US30", d: "Dow 30" },
                            { s: "INDEX:NKY", d: "Japan 225" },
                            { s: "TVC:DAX", d: "DAX" },
                            { s: "TVC:UKX", d: "FTSE 100" }
                        ],
                        originalTitle: "Indices"
                    },
                    {
                        title: "Futures",
                        symbols: [
                            { s: "BMFBOVESPA:ISP1!", d: "S&P 500 Futures" },
                            { s: "BMFBOVESPA:EUR1!", d: "Euro Futures" },
                            { s: "TVC:GOLD", d: "Gold" },
                            { s: "NYMEX:CL1!", d: "WTI Crude Oil" },
                            { s: "BMFBOVESPA:CCM1!", d: "Corn" }
                        ],
                        originalTitle: "Futures"
                    },
                    {
                        title: "Bonds",
                        symbols: [
                            { s: "EUREX:FGBL1!", d: "Euro Bund" },
                            { s: "EUREX:FBTP1!", d: "Euro BTP" },
                            { s: "EUREX:FGBM1!", d: "Euro BOBL" }
                        ],
                        originalTitle: "Bonds"
                    },
                    {
                        title: "Forex",
                        symbols: [
                            { s: "FX:EURUSD", d: "EUR/USD" },
                            { s: "FX:GBPUSD", d: "GBP/USD" },
                            { s: "FX:USDJPY", d: "USD/JPY" },
                            { s: "FX:USDCHF", d: "USD/CHF" },
                            { s: "FX:AUDUSD", d: "AUD/USD" },
                            { s: "FX:USDCAD", d: "USD/CAD" }
                        ],
                        originalTitle: "Forex"
                    },
                    {
                        title: "Crypto",
                        symbols: [
                            {
                                s: "BITSTAMP:BTCUSD",
                                d: "Bitcoin",
                                "base-currency-logoid": "crypto/XTVCBTC",
                                "currency-logoid": "country/US"
                            },
                            {
                                s: "BINANCE:ETHUSDT",
                                d: "Ethereum",
                                "base-currency-logoid": "crypto/XTVCETH",
                                "currency-logoid": "crypto/XTVCUSDT"
                            },
                            {
                                s: "COINBASE:SOLUSD",
                                d: "Solana",
                                "base-currency-logoid": "crypto/XTVCSOL",
                                "currency-logoid": "country/US"
                            },
                            {
                                s: "CRYPTOCAP:TOTAL",
                                d: "Crypto Market Cap",
                                logoid: "crypto-total-market-cap",
                                "currency-logoid": "country/US"
                            },
                            {
                                s: "BINANCE:XRPUSDT",
                                d: "XRP",
                                "base-currency-logoid": "crypto/XTVCXRP",
                                "currency-logoid": "crypto/XTVCUSDT"
                            },
                            {
                                s: "BINANCE:DOGEUSDT",
                                d: "Dogecoin",
                                "base-currency-logoid": "crypto/XTVCDOGE",
                                "currency-logoid": "crypto/XTVCUSDT"
                            },
                            {
                                s: "BINANCE:ZECUSDT",
                                d: "Zcash",
                                "base-currency-logoid": "crypto/XTVCZEC",
                                "currency-logoid": "crypto/XTVCUSDT"
                            }
                        ],
                        originalTitle: "Crypto"
                    }
                ],
                support_host: "https://www.tradingview.com",
                width: "100%",
                height: "100%",
                showSymbolLogo: true,
                showChart: true
            }
        );
    }, []);

    return (
        <section style={styles.wrapper}>
            <div style={styles.header}>
                <h2 style={styles.title}>Global Markets</h2>
                <span style={styles.meta}>Powered by TradingView</span>
            </div>

            <div style={styles.grid}>
                <div style={styles.leftCard}>
                    <div
                        ref={leftRef}
                        className="tradingview-widget-container"
                        style={styles.widgetContainer}
                    />
                </div>

                <div style={styles.rightCard}>
                    <div
                        ref={rightRef}
                        className="tradingview-widget-container"
                        style={styles.widgetContainer}
                    />
                </div>
            </div>
        </section>
    );
}

const styles = {
    wrapper: {
        marginTop: "24px",
        borderTop: "1px solid rgba(148, 163, 184, 0.12)",
        paddingTop: "24px"
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "12px",
        flexWrap: "wrap",
        marginBottom: "16px"
    },
    title: {
        margin: 0,
        fontSize: "30px",
        fontWeight: 700,
        color: "#f8fafc"
    },
    meta: {
        fontSize: "14px",
        color: "#94a3b8"
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "2fr 1fr",
        gap: "20px",
        alignItems: "stretch"
    },
    leftCard: {
        minHeight: "540px",
        border: "1px solid rgba(148, 163, 184, 0.12)",
        backgroundColor: "#050b14",
        borderRadius: "20px",
        overflow: "hidden"
    },
    rightCard: {
        minHeight: "540px",
        border: "1px solid rgba(148, 163, 184, 0.12)",
        backgroundColor: "#050b14",
        borderRadius: "20px",
        overflow: "hidden"
    },
    widgetContainer: {
        width: "100%",
        height: "100%",
        minHeight: "540px"
    }
};

export default memo(TradingViewWidgets);