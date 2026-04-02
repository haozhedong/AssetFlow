const BASE_URL = "http://localhost:8080";

export async function streamChatMessage(message, portfolioContext) {
    const response = await fetch(`${BASE_URL}/api/ai/chat/stream`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify({
            message,
            portfolioContext: portfolioContext || {}
        }),
    });

    if (!response.ok) {
        throw new Error(`Failed to stream chat: ${response.statusText}`);
    }

    return response;
}

export async function clearChatHistory() {
    const response = await fetch(`${BASE_URL}/api/ai/chat/history`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        throw new Error("Failed to clear history");
    }

    return response.json();
}