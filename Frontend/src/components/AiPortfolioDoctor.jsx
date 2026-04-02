import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle } from "lucide-react";
import { getAiPortfolioSummary } from "../api/dashboardApi";

const DIAGNOSTIC_MESSAGES = [
    "Analyzing your portfolio structure...",
    "Calculating risk metrics...",
    "Evaluating asset allocation...",
    "Identifying potential risks...",
    "Generating personalized recommendations...",
    "Preparing final report...",
];

export default function AiPortfolioDoctor() {
    const [aiSummary, setAiSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [messageIndex, setMessageIndex] = useState(0);
    const [elapsedTime, setElapsedTime] = useState(0);

    useEffect(() => {
        if (!loading) return;

        const messageInterval = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % DIAGNOSTIC_MESSAGES.length);
        }, 3000);

        return () => clearInterval(messageInterval);
    }, [loading]);

    useEffect(() => {
        if (!loading) return;

        const timerInterval = setInterval(() => {
            setElapsedTime((prev) => prev + 1);
        }, 1000);

        return () => clearInterval(timerInterval);
    }, [loading]);

    useEffect(() => {
        let isMounted = true;

        async function fetchAiSummary() {
            try {
                const data = await getAiPortfolioSummary();

                if (isMounted) {
                    setAiSummary(data.text);
                    setError("");
                    setLoading(false);
                }
            } catch (err) {
                if (isMounted) {
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

    if (loading) {
        return (
            <div style={styles.loadingBox}>
                <div style={styles.spinner}></div>
                <p style={styles.diagnosticMessage}>
                    {DIAGNOSTIC_MESSAGES[messageIndex]}
                </p>
                <p style={styles.timerInfo}>Elapsed: {formatTime(elapsedTime)}</p>
                <p style={styles.estimatedTime}>
                    Analysis typically takes 1-3 minutes
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.errorBox}>
                <AlertCircle size={20} style={styles.errorIcon} />
                <div style={styles.errorContent}>
                    <p style={styles.errorMessage}>{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        style={styles.retryButton}
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.wrapper}>
            <div style={styles.contentBox}>
                <div className="custom-scrollbar" style={styles.markdownContent}>
                    {aiSummary && renderFormattedContent(aiSummary)}
                </div>
            </div>

            <div style={styles.footer}>
                <CheckCircle size={16} style={styles.successIcon} />
                <span style={styles.footerText}>Analysis completed</span>
            </div>
        </div>
    );
}

function stripMarkdownSymbols(text) {
    return text
        .replace(/\*\*/g, "")
        .replace(/\*/g, "")
        .replace(/^#{1,6}\s*/, "")
        .trim();
}

function renderFormattedContent(content) {
    const lines = content.split("\n");
    const elements = [];
    let listBuffer = [];

    const flushList = (keyPrefix) => {
        if (listBuffer.length > 0) {
            elements.push(
                <ul key={`list-${keyPrefix}`} style={styles.ul}>
                    {listBuffer.map((item, idx) => (
                        <li key={`${keyPrefix}-${idx}`} style={styles.li}>
                            {item}
                        </li>
                    ))}
                </ul>
            );
            listBuffer = [];
        }
    };

    lines.forEach((line, idx) => {
        const trimmed = line.trim();
        const cleaned = stripMarkdownSymbols(trimmed);

        if (trimmed === "") {
            flushList(idx);
            elements.push(<div key={`space-${idx}`} style={styles.spacer} />);
            return;
        }

        if (trimmed.startsWith("- ") || /^\d+\.\s/.test(trimmed)) {
            const listText = trimmed
                .replace(/^- /, "")
                .replace(/^\d+\.\s/, "")
                .trim();

            listBuffer.push(stripMarkdownSymbols(listText));
            return;
        }

        flushList(idx);

        if (trimmed.startsWith("### ")) {
            elements.push(
                <h3 key={`h3-${idx}`} style={styles.h3}>
                    {stripMarkdownSymbols(trimmed.replace(/^### /, ""))}
                </h3>
            );
            return;
        }

        if (trimmed.startsWith("## ")) {
            elements.push(
                <h3 key={`h2-${idx}`} style={styles.h3}>
                    {stripMarkdownSymbols(trimmed.replace(/^## /, ""))}
                </h3>
            );
            return;
        }

        if (trimmed.startsWith("# ")) {
            elements.push(
                <h3 key={`h1-${idx}`} style={styles.h3}>
                    {stripMarkdownSymbols(trimmed.replace(/^# /, ""))}
                </h3>
            );
            return;
        }

        if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
            elements.push(
                <p key={`strong-${idx}`} style={styles.p}>
                    <strong style={styles.strong}>{cleaned}</strong>
                </p>
            );
            return;
        }

        elements.push(
            <p key={`p-${idx}`} style={styles.p}>
                {cleaned}
            </p>
        );
    });

    flushList("end");

    return elements;
}

const styles = {
    wrapper: {
        background: "transparent",
        padding: "0",
        borderRadius: "8px",
    },

    loadingBox: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
        gap: "16px",
        minHeight: "280px",
        borderRadius: "8px",
        borderTop: "1px solid rgba(148, 163, 184, 0.15)",
        borderBottom: "1px solid rgba(148, 163, 184, 0.15)",
        background:
            "linear-gradient(135deg, rgba(59, 130, 246, 0.04) 0%, rgba(99, 102, 241, 0.04) 100%)",
    },

    spinner: {
        width: "48px",
        height: "48px",
        border: "2px solid rgba(59, 130, 246, 0.15)",
        borderTop: "2px solid #3b82f6",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
    },

    diagnosticMessage: {
        margin: "0",
        fontSize: "15px",
        fontWeight: 600,
        color: "#60a5fa",
        textAlign: "center",
    },

    timerInfo: {
        margin: "4px 0 0 0",
        fontSize: "13px",
        color: "#94a3b8",
        textAlign: "center",
    },

    estimatedTime: {
        margin: "4px 0 0 0",
        fontSize: "12px",
        color: "#64748b",
        textAlign: "center",
        fontStyle: "italic",
    },

    errorBox: {
        display: "flex",
        alignItems: "flex-start",
        padding: "20px",
        gap: "12px",
        borderRadius: "8px",
        borderTop: "1px solid rgba(239, 68, 68, 0.3)",
        borderBottom: "1px solid rgba(239, 68, 68, 0.3)",
        background: "rgba(239, 68, 68, 0.06)",
    },

    errorIcon: {
        color: "#f87171",
        flexShrink: 0,
        marginTop: "2px",
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
        marginTop: "4px",
        padding: "8px 16px",
        backgroundColor: "#ef4444",
        color: "#fff",
        border: "none",
        borderRadius: "4px",
        fontSize: "13px",
        fontWeight: 600,
        cursor: "pointer",
        width: "fit-content",
        transition: "all 0.2s ease",
    },

    contentBox: {
        width: "100%",
        borderRadius: "8px",
        borderTop: "1px solid rgba(148, 163, 184, 0.15)",
        borderBottom: "1px solid rgba(148, 163, 184, 0.15)",
        padding: "20px 0",
        background: "transparent",
    },

    markdownContent: {
        overflowY: "auto",
        maxHeight: "600px",
        paddingRight: "8px",
    },

    h3: {
        margin: "18px 0 12px 0",
        fontSize: "15px",
        fontWeight: 700,
        color: "#f0f4f8",
        lineHeight: 1.4,
        textTransform: "capitalize",
    },

    p: {
        margin: "10px 0",
        fontSize: "14px",
        color: "#cbd5e1",
        lineHeight: 1.7,
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
    },

    strong: {
        color: "#f0f4f8",
        fontWeight: 700,
    },

    ul: {
        margin: "8px 0 12px 0",
        paddingLeft: "24px",
    },

    li: {
        margin: "8px 0",
        fontSize: "14px",
        color: "#cbd5e1",
        lineHeight: 1.7,
        listStyleType: "disc",
    },

    spacer: {
        height: "8px",
    },

    footer: {
        marginTop: "12px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        justifyContent: "flex-end",
    },

    successIcon: {
        color: "#22c55e",
    },

    footerText: {
        fontSize: "12px",
        color: "#64748b",
    },
};

if (typeof document !== "undefined" && !document.getElementById("ai-portfolio-doctor-animations")) {
    const style = document.createElement("style");
    style.id = "ai-portfolio-doctor-animations";
    style.textContent = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;
    document.head.appendChild(style);
}