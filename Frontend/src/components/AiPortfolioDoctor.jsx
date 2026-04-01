import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle, Loader } from "lucide-react";
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

    // Message rotation
    useEffect(() => {
        if (!loading) return;

        const messageInterval = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % DIAGNOSTIC_MESSAGES.length);
        }, 3000);

        return () => clearInterval(messageInterval);
    }, [loading]);

    // Timer
    useEffect(() => {
        if (!loading) return;

        const timerInterval = setInterval(() => {
            setElapsedTime((prev) => prev + 1);
        }, 1000);

        return () => clearInterval(timerInterval);
    }, [loading]);

    // Fetch data
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

    // Loading state
    if (loading) {
        return (
            <section style={styles.wrapper}>
                <div style={styles.header}>
                    <h2 style={styles.title}>Portfolio Doctor</h2>
                    <span style={styles.badge}>AI ANALYSIS</span>
                </div>

                <div style={styles.loadingBox}>
                    <div style={styles.spinner}></div>
                    <p style={styles.diagnosticMessage}>{DIAGNOSTIC_MESSAGES[messageIndex]}</p>
                    <p style={styles.timerInfo}>Elapsed: {formatTime(elapsedTime)}</p>
                    <p style={styles.estimatedTime}>Analysis typically takes 1-3 minutes</p>
                </div>
            </section>
        );
    }

    // Error state
    if (error) {
        return (
            <section style={styles.wrapper}>
                <div style={styles.header}>
                    <h2 style={styles.title}>Portfolio Doctor</h2>
                    <span style={styles.badge}>AI ANALYSIS</span>
                </div>

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
            </section>
        );
    }

    // Success state - Formatted content display
    return (
        <section style={styles.wrapper}>
            <div style={styles.header}>
                <h2 style={styles.title}>Portfolio Doctor</h2>
                <span style={styles.badge}>AI ANALYSIS</span>
            </div>

            <div style={styles.contentBox}>
                <div style={styles.markdownContent}>
                    {aiSummary && renderFormattedContent(aiSummary)}
                </div>
            </div>

            <div style={styles.footer}>
                <CheckCircle size={16} style={styles.successIcon} />
                <span style={styles.footerText}>Analysis completed</span>
            </div>
        </section>
    );
}

// Helper function to render formatted content
function renderFormattedContent(content) {
    return content.split("\n").map((line, idx) => {
        const trimmed = line.trim();

        // Empty lines
        if (trimmed === "") {
            return <div key={idx} style={{ height: "8px" }} />;
        }

        // Headings
        if (trimmed.startsWith("### ")) {
            return (
                <h3 key={idx} style={styles.h3}>
                    {trimmed.replace(/^### /, "")}
                </h3>
            );
        }

        // Bold text
        if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
            return (
                <p key={idx} style={styles.p}>
                    <strong style={styles.strong}>
                        {trimmed.replace(/\*\*/g, "")}
                    </strong>
                </p>
            );
        }

        // List items
        if (trimmed.startsWith("- ")) {
            return (
                <li key={idx} style={styles.li}>
                    {trimmed.replace(/^- /, "")}
                </li>
            );
        }

        // Regular paragraphs
        return (
            <p key={idx} style={styles.p}>
                {trimmed}
            </p>
        );
    });
}

const styles = {
    wrapper: {
        background: "transparent",
        padding: "0",
        borderRadius: "8px",
    },

    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "16px",
        gap: "12px",
        flexWrap: "wrap",
    },

    title: {
        margin: 0,
        color: "#f0f4f8",
        fontSize: "18px",
        fontWeight: 700,
        letterSpacing: "0.02em",
    },

    badge: {
        display: "inline-block",
        padding: "6px 12px",
        backgroundColor: "rgba(59, 130, 246, 0.12)",
        color: "#60a5fa",
        fontSize: "10px",
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        borderRadius: "4px",
        border: "1px solid rgba(59, 130, 246, 0.25)",
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
        background: "linear-gradient(135deg, rgba(59, 130, 246, 0.04) 0%, rgba(99, 102, 241, 0.04) 100%)",
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
    },

    strong: {
        color: "#f0f4f8",
        fontWeight: 700,
    },

    li: {
        margin: "8px 0",
        marginLeft: "24px",
        fontSize: "14px",
        color: "#cbd5e1",
        lineHeight: 1.7,
        listStyleType: "disc",
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

// Add CSS animations
if (typeof document !== "undefined") {
    const style = document.createElement("style");
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