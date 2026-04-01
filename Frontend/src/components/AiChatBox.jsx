import { useEffect, useRef, useState } from "react";
import { Send, AlertCircle } from "lucide-react";

export default function AiChatBox() {
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: "assistant",
            content: "Hello! I'm your AI portfolio assistant. Feel free to ask me any questions about your portfolio, investment strategies, or market insights.",
        },
    ]);
    const [inputValue, setInputValue] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        // Add user message
        const userMessage = {
            id: Date.now(),
            type: "user",
            content: inputValue,
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputValue("");
        setLoading(true);
        setError("");

        // Send to AI API
        try {
            // TODO: Replace with your actual API endpoint
            // const response = await fetch('/api/ai/chat', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ message: inputValue })
            // });
            // const data = await response.json();

            // Simulated response
            setTimeout(() => {
                const aiMessage = {
                    id: Date.now() + 1,
                    type: "assistant",
                    content:
                        "This is a sample response. Please configure your AI backend integration to enable real chat functionality.",
                };
                setMessages((prev) => [...prev, aiMessage]);
                setLoading(false);
            }, 1000);
        } catch (err) {
            setError(err.message || "Failed to send message");
            setLoading(false);
        }
    };

    return (
        <div style={styles.chatBox}>
            <div style={styles.header}>
                <div>
                    <h3 style={styles.title}>Chat with AI Assistant</h3>
                    <p style={styles.subtitle}>Ask questions about your portfolio</p>
                </div>
            </div>

            {error && (
                <div style={styles.errorNotification}>
                    <AlertCircle size={16} style={styles.errorIcon} />
                    <span style={styles.errorText}>{error}</span>
                </div>
            )}

            <div style={styles.messagesContainer}>
                {messages.map((message) => (
                    <div
                        key={message.id}
                        style={{
                            ...styles.messageWrapper,
                            justifyContent:
                                message.type === "user"
                                    ? "flex-end"
                                    : "flex-start",
                        }}
                    >
                        <div
                            style={{
                                ...styles.message,
                                ...(message.type === "user"
                                    ? styles.userMessage
                                    : styles.assistantMessage),
                            }}
                        >
                            {message.content}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div style={styles.messageWrapper}>
                        <div style={styles.assistantMessage}>
                            <div style={styles.typingIndicator}>
                                <span style={styles.typingDot}></span>
                                <span style={styles.typingDot}></span>
                                <span style={styles.typingDot}></span>
                            </div>
                        </div>
                    </div>
                )}
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
                />
                <button
                    type="submit"
                    style={{
                        ...styles.sendButton,
                        opacity: loading || !inputValue.trim() ? 0.5 : 1,
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
        height: "600px",
        borderRadius: "12px",
        backgroundColor: "#1e293b",
        border: "1px solid rgba(148, 163, 184, 0.2)",
        overflow: "hidden",
        transition: "all 0.3s ease",
    },

    header: {
        padding: "20px",
        borderBottom: "1px solid rgba(148, 163, 184, 0.15)",
        backgroundColor: "#0f172a",
    },

    title: {
        margin: "0 0 4px 0",
        fontSize: "16px",
        fontWeight: 700,
        color: "#f0f4f8",
    },

    subtitle: {
        margin: 0,
        fontSize: "13px",
        color: "#94a3b8",
        fontWeight: 400,
    },

    errorNotification: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "12px 16px",
        margin: "12px 16px 0 16px",
        borderRadius: "6px",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        border: "1px solid rgba(239, 68, 68, 0.3)",
    },

    errorIcon: {
        color: "#f87171",
        flexShrink: 0,
    },

    errorText: {
        fontSize: "13px",
        color: "#f87171",
    },

    messagesContainer: {
        flex: 1,
        overflowY: "auto",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        backgroundColor: "#1e293b",
    },

    messageWrapper: {
        display: "flex",
        gap: "12px",
        animation: "fadeIn 0.3s ease",
    },

    message: {
        maxWidth: "75%",
        padding: "12px 14px",
        borderRadius: "8px",
        fontSize: "14px",
        lineHeight: 1.5,
        wordWrap: "break-word",
        animation: "slideUp 0.3s ease",
    },

    userMessage: {
        backgroundColor: "#3b82f6",
        color: "#fff",
        borderBottomRightRadius: "2px",
    },

    assistantMessage: {
        backgroundColor: "rgba(148, 163, 184, 0.1)",
        color: "#cbd5e1",
        border: "1px solid rgba(148, 163, 184, 0.15)",
        borderBottomLeftRadius: "2px",
    },

    typingIndicator: {
        display: "flex",
        gap: "6px",
        alignItems: "center",
        height: "18px",
    },

    typingDot: {
        width: "6px",
        height: "6px",
        borderRadius: "50%",
        backgroundColor: "#60a5fa",
        animation: "typing 1.4s infinite",
    },

    inputForm: {
        display: "flex",
        gap: "8px",
        padding: "16px",
        borderTop: "1px solid rgba(148, 163, 184, 0.15)",
        backgroundColor: "#0f172a",
        flexShrink: 0,
    },

    input: {
        flex: 1,
        padding: "12px 14px",
        borderRadius: "8px",
        backgroundColor: "#1e293b",
        border: "1px solid rgba(148, 163, 184, 0.2)",
        color: "#f0f4f8",
        fontSize: "14px",
        outline: "none",
        transition: "all 0.2s ease",
    },

    sendButton: {
        width: "40px",
        height: "40px",
        borderRadius: "8px",
        backgroundColor: "#3b82f6",
        color: "#fff",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.2s ease",
        flexShrink: 0,
    },
};

// Add CSS animations
if (typeof document !== "undefined") {
    const style = document.createElement("style");
    style.textContent = `
        @keyframes typing {
            0%, 60%, 100% {
                transform: translateY(0);
                opacity: 0.6;
            }
            30% {
                transform: translateY(-8px);
                opacity: 1;
            }
        }

        @keyframes fadeIn {
            from {
                opacity: 0;
            }
            to {
                opacity: 1;
            }
        }

        @keyframes slideUp {
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