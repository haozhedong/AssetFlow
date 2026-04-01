import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import { getAiPortfolioSummary } from "../api/dashboardApi";


const DIAGNOSTIC_MESSAGES = [
    "🔍 分析您的投资组合结构...",
    "📊 计算风险评分...",
    "🎯 评估资产配置...",
    "⚠️ 识别潜在风险...",
    "💡 生成个性化建议...",
    "✨ 准备最终报告...",
];

export default function AiPortfolioDoctor() {
    const [aiSummary, setAiSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [messageIndex, setMessageIndex] = useState(0);
    const [elapsedTime, setElapsedTime] = useState(0);

    // 消息轮换
    useEffect(() => {
        if (!loading) return;

        const messageInterval = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % DIAGNOSTIC_MESSAGES.length);
        }, 15000);

        return () => clearInterval(messageInterval);
    }, [loading]);

    // 计时器
    useEffect(() => {
        if (!loading) return;

        const timerInterval = setInterval(() => {
            setElapsedTime((prev) => prev + 1);
        }, 1000);

        return () => clearInterval(timerInterval);
    }, [loading]);

    // 获取数据
    useEffect(() => {
        let isMounted = true;

        async function fetchAiSummary() {
            try {
                console.log("开始加载 AI 诊断...");
                const data = await getAiPortfolioSummary();

                if (isMounted) {
                    console.log("AI 诊断加载成功");
                    setAiSummary(data.text);
                    setError("");
                    setLoading(false);
                }
            } catch (err) {
                if (isMounted) {
                    console.error("AI 诊断加载失败:", err);
                    setError(err.message || "Failed to load AI diagnosis");
                    setLoading(false);
                }
            }
        }

        fetchAiSummary();

        return () => {
            isMounted = false;
        };
    }, []);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs.toString().padStart(2, "0")}`;
    };

    // 加载中
    if (loading) {
        return (
            <section style={styles.wrapper}>
                <div style={styles.header}>
                    <h2 style={styles.title}>AI Portfolio Doctor</h2>
                    <span style={styles.badge}>AI Analysis</span>
                </div>

                <div style={styles.loadingBox}>
                    <div style={styles.spinner}></div>
                    <p style={styles.diagnosticMessage}>{DIAGNOSTIC_MESSAGES[messageIndex]}</p>
                    <p style={styles.timerInfo}>已用时间: {formatTime(elapsedTime)}</p>
                    <p style={styles.estimatedTime}>诊断通常需要 1-3 分钟，请耐心等待...</p>
                </div>
            </section>
        );
    }

    // 错误
    if (error) {
        return (
            <section style={styles.wrapper}>
                <div style={styles.header}>
                    <h2 style={styles.title}>AI Portfolio Doctor</h2>
                    <span style={styles.badge}>AI Analysis</span>
                </div>

                <div style={styles.errorBox}>
                    <AlertCircle size={24} style={{ color: "#fca5a5", marginRight: "12px", flexShrink: 0 }} />
                    <div style={styles.errorContent}>
                        <p style={styles.errorMessage}>{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            style={styles.retryButton}
                        >
                            🔄 重新加载页面
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    // 成功 - 简单显示文本
    return (
        <section style={styles.wrapper}>
            <div style={styles.header}>
                <h2 style={styles.title}>AI Portfolio Doctor</h2>
                <span style={styles.badge}>AI Analysis</span>
            </div>

            <div style={styles.contentBox}>
                <div style={styles.markdownContent}>
                    {aiSummary && aiSummary.split("\n").map((line, idx) => {
                        // 简单的 markdown 处理
                        if (line.startsWith("###")) {
                            return <h3 key={idx} style={styles.h3}>{line.replace(/^#+\s/, "")}</h3>;
                        }
                        if (line.startsWith("**")) {
                            return <p key={idx} style={styles.p}><strong style={styles.strong}>{line.replace(/\*\*/g, "")}</strong></p>;
                        }
                        if (line.startsWith("*")) {
                            return <li key={idx} style={styles.li}>{line.replace(/^\*\s/, "")}</li>;
                        }
                        if (line.trim() === "") {
                            return <div key={idx} style={{ height: "8px" }} />;
                        }
                        return <p key={idx} style={styles.p}>{line}</p>;
                    })}
                </div>
            </div>

            <div style={styles.footer}>
                <span style={styles.footerText}>Powered by AI Analysis</span>
            </div>
        </section>
    );
}

const styles = {
    wrapper: {
        background: "transparent",
        padding: "0",
    },

    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "12px",
        gap: "12px",
        flexWrap: "wrap",
    },

    title: {
        margin: 0,
        color: "#e5e7eb",
        fontSize: "16px",
        fontWeight: 700,
        letterSpacing: "0.02em",
    },

    badge: {
        display: "inline-block",
        padding: "4px 10px",
        backgroundColor: "rgba(59, 130, 246, 0.15)",
        color: "#60a5fa",
        fontSize: "11px",
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        borderRadius: "4px",
        border: "1px solid rgba(59, 130, 246, 0.3)",
    },

    loadingBox: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 24px",
        gap: "16px",
        minHeight: "320px",
        borderTop: "1px solid rgba(148, 163, 184, 0.18)",
        borderBottom: "1px solid rgba(148, 163, 184, 0.18)",
        background: "linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(99, 102, 241, 0.05) 100%)",
    },

    spinner: {
        width: "50px",
        height: "50px",
        border: "3px solid rgba(59, 130, 246, 0.2)",
        borderTop: "3px solid #3b82f6",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
    },

    diagnosticMessage: {
        margin: "0",
        fontSize: "16px",
        fontWeight: 600,
        color: "#60a5fa",
        textAlign: "center",
    },

    timerInfo: {
        margin: "8px 0 0 0",
        fontSize: "14px",
        color: "#94a3b8",
        textAlign: "center",
    },

    estimatedTime: {
        margin: "8px 0 0 0",
        fontSize: "13px",
        color: "#64748b",
        textAlign: "center",
        fontStyle: "italic",
    },

    errorBox: {
        display: "flex",
        alignItems: "flex-start",
        padding: "24px",
        gap: "12px",
        borderTop: "1px solid rgba(239, 68, 68, 0.35)",
        borderBottom: "1px solid rgba(239, 68, 68, 0.35)",
        background: "rgba(239, 68, 68, 0.08)",
    },

    errorContent: {
        display: "flex",
        flexDirection: "column",
        gap: "12px",
    },

    errorMessage: {
        margin: "0",
        fontSize: "14px",
        color: "#f87171",
        lineHeight: 1.6,
    },

    retryButton: {
        marginTop: "8px",
        padding: "8px 16px",
        backgroundColor: "#ef4444",
        color: "#fff",
        border: "none",
        borderRadius: "4px",
        fontSize: "14px",
        fontWeight: 600,
        cursor: "pointer",
        width: "fit-content",
    },

    contentBox: {
        width: "100%",
        borderTop: "1px solid rgba(148, 163, 184, 0.18)",
        borderBottom: "1px solid rgba(148, 163, 184, 0.18)",
        padding: "16px 0",
        background: "transparent",
    },

    markdownContent: {
        overflowY: "auto",
        maxHeight: "600px",
    },

    h3: {
        margin: "16px 0 12px 0",
        fontSize: "16px",
        fontWeight: 700,
        color: "#f8fafc",
        lineHeight: 1.4,
    },

    p: {
        margin: "8px 0",
        fontSize: "14px",
        color: "#94a3b8",
        lineHeight: 1.6,
    },

    strong: {
        color: "#f8fafc",
        fontWeight: 700,
    },

    li: {
        margin: "6px 0",
        marginLeft: "20px",
        fontSize: "14px",
        color: "#94a3b8",
        lineHeight: 1.6,
    },

    footer: {
        marginTop: "12px",
        textAlign: "right",
    },

    footerText: {
        fontSize: "12px",
        color: "#64748b",
        fontStyle: "italic",
    },
};

// 添加 CSS 动画
if (typeof document !== "undefined") {
    const style = document.createElement("style");
    style.textContent = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;
    document.head.appendChild(style);
}