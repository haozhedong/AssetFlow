import { useEffect, useRef } from "react";

export default function TradingViewTopStories({ totalHeight = 320 }) {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        containerRef.current.innerHTML = "";

        const widgetContainer = document.createElement("div");
        widgetContainer.className = "tradingview-widget-container";
        widgetContainer.style.height = "100%";
        widgetContainer.style.width = "100%";

        const widgetDiv = document.createElement("div");
        widgetDiv.className = "tradingview-widget-container__widget";
        widgetDiv.style.height = "calc(100% - 24px)";
        widgetDiv.style.width = "100%";

        const copyright = document.createElement("div");
        copyright.className = "tradingview-widget-copyright";
        copyright.style.marginTop = "6px";
        copyright.innerHTML =
            '<a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank"><span class="blue-text">News by TradingView</span></a>';

        const script = document.createElement("script");
        script.type = "text/javascript";
        script.src =
            "https://s3.tradingview.com/external-embedding/embed-widget-timeline.js";
        script.async = true;
        script.innerHTML = JSON.stringify({
            feedMode: "all_symbols",
            isTransparent: true,
            displayMode: "adaptive",
            width: "100%",
            height: "100%",
            colorTheme: "dark",
            locale: "en",
        });

        widgetContainer.appendChild(widgetDiv);
        widgetContainer.appendChild(copyright);
        widgetContainer.appendChild(script);
        containerRef.current.appendChild(widgetContainer);
    }, [totalHeight]);

    return (
        <section style={{ ...styles.wrapper, height: totalHeight }}>
            <div style={styles.header}>
                <div>
                    <h3 style={styles.title}>Top Stories</h3>
                    <p style={styles.subtitle}>Quick market headlines while you trade</p>
                </div>
            </div>

            <div style={styles.body}>
                <div ref={containerRef} style={styles.host} />
            </div>
        </section>
    );
}

const styles = {
    wrapper: {
        background: "#1e293b",
        borderTop: "1px solid #334155",
        borderBottom: "1px solid #334155",
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        boxSizing: "border-box",
    },

    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "12px",
        padding: "12px 0",
        borderBottom: "1px solid #334155",
        flexShrink: 0,
    },

    title: {
        margin: 0,
        fontSize: "16px",
        fontWeight: 700,
        color: "#f8fafc",
    },

    subtitle: {
        margin: "6px 0 0 0",
        fontSize: "12px",
        color: "#94a3b8",
    },

    body: {
        flex: 1,
        minHeight: 0,
        paddingTop: "12px",
        boxSizing: "border-box",
        overflow: "hidden",
    },

    host: {
        width: "100%",
        height: "100%",
    },
};