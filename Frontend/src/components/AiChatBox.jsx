import { useEffect, useRef, useState } from "react";
import { Send, Trash2, AlertCircle } from "lucide-react";

const WELCOME_MESSAGE = {
    id: 1,
    type: "assistant",
    content:
        "Hello! I'm your AI portfolio assistant. I have access to your portfolio data and can provide personalized recommendations. Feel free to ask me anything!",
};

function normalizeChunk(text) {
    return text.replace(/\s+/g, " ").trim();
}

export default function AiChatBox() {
    const [messages, setMessages] = useState([WELCOME_MESSAGE]);
    const [inputValue, setInputValue] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [portfolioData, setPortfolioData] = useState(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const loadPortfolioData = async () => {
            try {
                const response = await fetch("http://localhost:8080/api/dashboard/overview");
                if (!response.ok) {
                    throw new Error("Failed to load portfolio data");
                }
                const data = await response.json();
                setPortfolioData(data);
            } catch (err) {
                console.error("Failed to load portfolio data:", err);
            }
        };

        loadPortfolioData();
    }, []);

    const handleSendMessage = async (e) => {
        e.preventDefault();

        if (!inputValue.trim() || loading) return;

        const userInput = inputValue.trim();
        const baseId = Date.now();
        const aiMessageId = baseId + 1;

        setMessages((prev) => [
            ...prev,
            { id: baseId, type: "user", content: userInput },
            { id: aiMessageId, type: "assistant", content: "" },
        ]);

        setInputValue("");
        setLoading(true);
        setError("");

        try {
            const response = await fetch("http://localhost:8080/api/ai/chat/stream", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json; charset=UTF-8",
                },
                body: JSON.stringify({
                    message: userInput,
                    portfolioContext: portfolioData || {},
                }),
            });

            if (!response.ok || !response.body) {
                throw new Error(`HTTP ${response.status}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");

            let buffer = "";
            let previousChunk = "";
            let fullResponse = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const events = buffer.split("\n\n");
                buffer = events.pop() || "";

                for (const event of events) {
                    const lines = event.split("\n");

                    for (const line of lines) {
                        if (!line.startsWith("data:")) continue;

                        const data = line.slice(5).trim();

                        if (!data) continue;

                        if (data === "[DONE]") {
                            setLoading(false);
                            try {
                                await reader.cancel();
                            } catch {
                                // ignore
                            }
                            return;
                        }

                        const normalizedChunk = normalizeChunk(data);
                        if (!normalizedChunk) continue;

                        if (normalizedChunk === previousChunk) {
                            continue;
                        }

                        const normalizedFull = normalizeChunk(fullResponse);

                        if (normalizedChunk === normalizedFull) {
                            previousChunk = normalizedChunk;
                            continue;
                        }

                        let chunkToAppend = data;

                        if (normalizedFull && normalizedChunk.startsWith(normalizedFull)) {
                            chunkToAppend = data.slice(fullResponse.length);
                        }

                        if (!chunkToAppend.trim()) {
                            previousChunk = normalizedChunk;
                            continue;
                        }

                        fullResponse += chunkToAppend;
                        previousChunk = normalizedChunk;

                        setMessages((prev) =>
                            prev.map((msg) =>
                                msg.id === aiMessageId
                                    ? { ...msg, content: msg.content + chunkToAppend }
                                    : msg
                            )
                        );
                    }
                }
            }

            setLoading(false);
        } catch (err) {
            console.error("Chat error:", err);
            setError(err.message || "Failed to send message");
            setLoading(false);

            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === aiMessageId
                        ? {
                            ...msg,
                            content: "Sorry, something went wrong while generating the reply.",
                        }
                        : msg
                )
            );
        }
    };

    const handleClearHistory = () => {
        setMessages([WELCOME_MESSAGE]);
        setError("");
    };

    return (
        <div style={styles.chatBox}>
            <div style={styles.header}>
                <div>
                    <h3 style={styles.title}>Chat with AI Assistant</h3>
                    <p style={styles.subtitle}>Ask about your portfolio</p>
                </div>

                <button
                    type="button"
                    onClick={handleClearHistory}
                    style={styles.clearButton}
                    title="Clear chat"
                >
                    <Trash2 size={16} />
                </button>
            </div>

            {error ? (
                <div style={styles.errorBanner}>
                    <AlertCircle size={16} style={{ flexShrink: 0 }} />
                    <span>{error}</span>
                </div>
            ) : null}

            <div className="custom-scrollbar" style={styles.messagesContainer}>
                {messages.map((message) => (
                    <div
                        key={message.id}
                        style={{
                            ...styles.messageRow,
                            justifyContent:
                                message.type === "user" ? "flex-end" : "flex-start",
                        }}
                    >
                        <div
                            style={{
                                ...styles.messageBubble,
                                ...(message.type === "user"
                                    ? styles.userMessage
                                    : styles.assistantMessage),
                            }}
                        >
                            {message.content || (loading && message.type === "assistant" ? "..." : "")}
                        </div>
                    </div>
                ))}

                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} style={styles.inputForm}>
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask me anything..."
                    style={styles.input}
                    disabled={loading}
                    autoComplete="off"
                />

                <button
                    type="submit"
                    style={{
                        ...styles.sendButton,
                        opacity: loading || !inputValue.trim() ? 0.6 : 1,
                        cursor: loading || !inputValue.trim() ? "not-allowed" : "pointer",
                    }}
                    disabled={loading || !inputValue.trim()}
                >
                    <Send size={18} />
                </button>
            </form>
        </div>
    );
}

const styles = {
    chatBox: {
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: "640px",
        border: "1px solid rgba(148, 163, 184, 0.18)",
        borderRadius: "16px",
        background:
            "linear-gradient(180deg, rgba(15, 23, 42, 0.92) 0%, rgba(17, 24, 39, 0.96) 100%)",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
        overflow: "hidden",
    },

    header: {
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        padding: "18px 18px 14px 18px",
        borderBottom: "1px solid rgba(148, 163, 184, 0.12)",
        background: "rgba(30, 41, 59, 0.35)",
    },

    title: {
        margin: 0,
        fontSize: "16px",
        fontWeight: 700,
        color: "#f8fafc",
    },

    subtitle: {
        margin: "4px 0 0 0",
        fontSize: "13px",
        color: "#94a3b8",
    },

    clearButton: {
        width: "36px",
        height: "36px",
        borderRadius: "10px",
        border: "1px solid rgba(148, 163, 184, 0.18)",
        background: "rgba(15, 23, 42, 0.5)",
        color: "#cbd5e1",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        flexShrink: 0,
    },

    errorBanner: {
        margin: "12px 16px 0 16px",
        padding: "10px 12px",
        borderRadius: "10px",
        background: "rgba(239, 68, 68, 0.12)",
        border: "1px solid rgba(239, 68, 68, 0.25)",
        color: "#fecaca",
        fontSize: "13px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
    },

    messagesContainer: {
        flex: 1,
        overflowY: "auto",
        padding: "18px 16px",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        minHeight: 0,
    },

    messageRow: {
        display: "flex",
        width: "100%",
    },

    messageBubble: {
        maxWidth: "78%",
        padding: "14px 16px",
        borderRadius: "14px",
        fontSize: "14px",
        lineHeight: 1.7,
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        boxSizing: "border-box",
    },

    userMessage: {
        background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
        color: "#eff6ff",
        borderTopRightRadius: "6px",
        boxShadow: "0 8px 20px rgba(37, 99, 235, 0.22)",
    },

    assistantMessage: {
        background: "rgba(51, 65, 85, 0.7)",
        color: "#e2e8f0",
        border: "1px solid rgba(148, 163, 184, 0.14)",
        borderTopLeftRadius: "6px",
    },

    inputForm: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "14px 16px 16px 16px",
        borderTop: "1px solid rgba(148, 163, 184, 0.12)",
        background: "rgba(15, 23, 42, 0.45)",
    },

    input: {
        flex: 1,
        height: "46px",
        borderRadius: "12px",
        border: "1px solid rgba(148, 163, 184, 0.18)",
        background: "rgba(30, 41, 59, 0.72)",
        color: "#f8fafc",
        padding: "0 14px",
        fontSize: "14px",
        outline: "none",
    },

    sendButton: {
        width: "46px",
        height: "46px",
        borderRadius: "12px",
        border: "none",
        background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
        color: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 8px 20px rgba(37, 99, 235, 0.24)",
    },
};