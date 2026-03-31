const BASE_URL = "http://localhost:8080";

export async function getDashboardOverview() {
  const response = await fetch(`${BASE_URL}/api/dashboard/overview`);

  if (!response.ok) {
    throw new Error("Failed to fetch dashboard overview");
  }

  return response.json();
}