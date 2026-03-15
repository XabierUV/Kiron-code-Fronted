import type {
  ChartRequest,
  ChartResponse,
  ReportRecordResponse,
} from "@/types/chart";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://luminous-patience-production.up.railway.app";

export async function fetchChart(payload: ChartRequest): Promise<ChartResponse> {
  const response = await fetch(`${API_BASE}/chart`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as ChartResponse;

  if (!response.ok || !data.ok) {
    throw new Error(data.error || "Chart request failed");
  }

  return data;
}

export async function fetchReport(reportId: string): Promise<ReportRecordResponse> {
  const response = await fetch(`${API_BASE}/report/${reportId}`, {
    method: "GET",
  });

  const data = (await response.json()) as ReportRecordResponse;

  if (!response.ok || !data.ok) {
    throw new Error(data.error || "Report request failed");
  }

  return data;
}

export async function createCheckout(payload: {
  chartId: string;
  reportId: string;
  productType: "CHIRON" | "NATAL_CHART" | "COMPATIBILITY";
}): Promise<{ ok: boolean; checkoutUrl?: string; sessionId?: string; error?: string }> {
  console.log("[createCheckout] API_BASE:", API_BASE);
  const response = await fetch(`${API_BASE}/checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok || !data.ok) {
    throw new Error(data.error || "Checkout request failed");
  }

  return data;
}

export async function fetchUnlockedReportBySession(sessionId: string) {
  const response = await fetch(
    `${API_BASE}/access/report?sessionId=${encodeURIComponent(sessionId)}`,
    {
      method: "GET",
    }
  );

  const data = await response.json();

  if (!response.ok || !data.ok) {
    throw new Error(data.error || "Unlocked report request failed");
  }

  return data;
}
export async function verifyCheckoutSession(sessionId: string) {
  const response = await fetch(
    `${API_BASE}/checkout/verify/${encodeURIComponent(sessionId)}`,
    {
      method: "GET",
    }
  );

  const data = await response.json();

  if (!response.ok || !data.ok) {
    throw new Error(data.error || "Checkout verification failed");
  }

  return data;
}