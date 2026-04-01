// 移除 BASE_URL，因为我们会使用相对路径通过代理
export async function getDashboardOverview() {
  const response = await fetch("/api/dashboard/overview");

  if (!response.ok) {
    throw new Error("Failed to fetch dashboard overview");
  }

  return response.json();
}

// 获取 AI Portfolio 诊断分析
export async function getAiPortfolioSummary() {
  try {
    console.log("开始请求 AI 诊断，URL: /api/insights/summary/ai");

    const response = await fetch("/api/insights/summary/ai", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("响应状态:", response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("错误响应:", errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("AI 诊断数据收到:", data);

    if (!data || !data.text) {
      throw new Error("Invalid response format: missing text field");
    }

    return data;
  } catch (error) {
    console.error("AI Portfolio 诊断请求失败:", error);
    throw error;
  }
}