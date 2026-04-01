const BASE_URL = "http://localhost:8080";

export async function getAllHoldings() {
  const response = await fetch(`${BASE_URL}/api/holdings/list`);
  if (!response.ok) throw new Error("Failed to fetch holdings");
  return response.json();
}

export async function getHoldingsWithPage(params = {}) {
  const searchParams = new URLSearchParams();
  if (params.keyword) searchParams.append("keyword", params.keyword);
  if (params.assetType) searchParams.append("assetType", params.assetType);
  if (params.market) searchParams.append("market", params.market);
  if (params.accountName) searchParams.append("accountName", params.accountName);
  searchParams.append("page", params.page || 1);
  searchParams.append("pageSize", params.pageSize || 10);
  searchParams.append("sortBy", params.sortBy || "id");
  searchParams.append("sortDir", params.sortDir || "asc");

  const response = await fetch(
    `${BASE_URL}/api/holdings?${searchParams.toString()}`
  );
  if (!response.ok) throw new Error("Failed to fetch holdings");
  return response.json();
}

export async function getHoldingById(id) {
  const response = await fetch(`${BASE_URL}/api/holdings/${id}`);
  if (!response.ok) throw new Error("Failed to fetch holding detail");
  return response.json();
}

export async function createHolding(payload) {
  const response = await fetch(`${BASE_URL}/api/holdings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Failed to create holding");
  }

  return response.json();
}

export async function updateHolding(id, payload) {
  const response = await fetch(`${BASE_URL}/api/holdings/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Failed to update holding");
  }

  return response.json();
}

export async function deleteHolding(id) {
  const response = await fetch(`${BASE_URL}/api/holdings/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Failed to delete holding");
  }
}

export function exportHoldingsToCsv(holdings) {
  const headers = [
    "id",
    "assetId",
    "quantity",
    "averageCost",
    "costCurrency",
    "purchaseDate",
    "accountName",
    "notes",
    "createdAt",
    "updatedAt",
  ];

  const rows = holdings.map((item) =>
    headers.map((header) => {
      const value = item[header] ?? "";
      return `"${String(value).replace(/"/g, '""')}"`
    })
  );

  const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "holdings.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  window.URL.revokeObjectURL(url);
}

export async function getAllAssets() {
  const response = await fetch(`${BASE_URL}/api/assets`);
  if (!response.ok) throw new Error("Failed to fetch assets");
  return response.json();
}

export async function createAsset(payload) {
  const response = await fetch(`${BASE_URL}/api/assets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Failed to create asset");
  }

  return response.json();
}