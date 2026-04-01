const BASE_URL = "http://localhost:8080";

export async function getAllTransactions(assetId) {
  const url = assetId
    ? `${BASE_URL}/api/transactions?assetId=${assetId}`
    : `${BASE_URL}/api/transactions`;

  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch transactions");
  return response.json();
}

export async function getTransactionById(id) {
  const response = await fetch(`${BASE_URL}/api/transactions/${id}`);
  if (!response.ok) throw new Error("Failed to fetch transaction detail");
  return response.json();
}

export async function createBuyTransaction(payload) {
  const response = await fetch(`${BASE_URL}/api/transactions/buy`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Failed to create buy transaction");
  }

  return response.json();
}

export async function createSellTransaction(payload) {
  const response = await fetch(`${BASE_URL}/api/transactions/sell`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Failed to create sell transaction");
  }

  return response.json();
}

export async function deleteTransaction(id) {
  const response = await fetch(`${BASE_URL}/api/transactions/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Failed to delete transaction");
  }
}