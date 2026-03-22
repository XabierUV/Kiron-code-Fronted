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
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = (await response.json()) as ChartResponse;
  if (!response.ok || !data.ok) throw new Error(data.error || "Chart request failed");
  return data;
}

export async function fetchReport(reportId: string): Promise<ReportRecordResponse> {
  const response = await fetch(`${API_BASE}/report/${reportId}`, { method: "GET" });
  const data = (await response.json()) as ReportRecordResponse;
  if (!response.ok || !data.ok) throw new Error(data.error || "Report request failed");
  return data;
}

export async function createCheckout(payload: {
  chartId: string;
  reportId?: string;
  productType: "CHIRON" | "NATAL_CHART" | "COMPATIBILITY" | "SUBSCRIPTION";
  deliveryEmail?: string;
  marketingConsent?: boolean;
  subscriberTimezone?: string;
  vinculoRelationship?: string;
  vinculoPersonBId?: string;
  vinculoPerson2Name?: string;
  vinculoPerson2Date?: string;
  vinculoPerson2Time?: string;
  vinculoPerson2City?: string;
}): Promise<{ ok: boolean; checkoutUrl?: string; sessionId?: string; error?: string }> {
  console.log("[createCheckout] API_BASE:", API_BASE);
  const response = await fetch(`${API_BASE}/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok || !data.ok) throw new Error(data.error || "Checkout request failed");
  return data;
}

export async function fetchUnlockedReportBySession(sessionId: string) {
  const response = await fetch(
    `${API_BASE}/access/report?sessionId=${encodeURIComponent(sessionId)}`,
    { method: "GET" }
  );
  const data = await response.json();
  if (!response.ok || !data.ok) throw new Error(data.error || "Unlocked report request failed");
  return data;
}

export async function verifyCheckoutSession(sessionId: string) {
  const response = await fetch(
    `${API_BASE}/checkout/verify/${encodeURIComponent(sessionId)}`,
    { method: "GET" }
  );
  const data = await response.json();
  if (!response.ok || !data.ok) throw new Error(data.error || "Checkout verification failed");
  return data;
}

// ── Auth ───────────────────────────────────────────────────────────────────
export async function authRegister(email: string, password: string) {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  if (!response.ok || !data.ok) throw new Error(data.error || "Register failed");
  return data as { ok: true; token: string; galaxyId: string };
}

export async function authLogin(email: string, password: string) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  if (!response.ok || !data.ok) throw new Error(data.error || "Login failed");
  return data as { ok: true; token: string; galaxyId: string };
}

export async function authForgotPassword(email: string) {
  const response = await fetch(`${API_BASE}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const data = await response.json();
  if (!response.ok || !data.ok) throw new Error(data.error || "Request failed");
  return data;
}

export async function authResetPassword(token: string, newPassword: string) {
  const response = await fetch(`${API_BASE}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, newPassword }),
  });
  const data = await response.json();
  if (!response.ok || !data.ok) throw new Error(data.error || "Reset failed");
  return data;
}

export async function authChangePassword(
  currentPassword: string,
  newPassword: string,
  jwt: string
) {
  const response = await fetch(`${API_BASE}/auth/change-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  const data = await response.json();
  if (!response.ok || !data.ok) throw new Error(data.error || "Change password failed");
  return data;
}

export async function fetchPortal(jwt: string) {
  const response = await fetch(`${API_BASE}/customer/portal`, {
    method: "GET",
    headers: { Authorization: `Bearer ${jwt}`, Pragma: "no-cache" },
    cache: "no-store",
  });
  const data = await response.json();
  if (!response.ok || !data.ok) throw new Error(data.error || "Portal access failed");
  return data as {
    ok: true;
    email: string;
    galaxyId: string;
    name: string | null;
    chiron: { sign: string; house: number; degree: number };
    chartId: string | null;
    reportId: string | null;
    products: Array<{ productType: string; name: string; pdfUrl: string | null; subscriptionStatus?: string | null; subscriptionRenewsAt?: string | null; stripeCustomerId?: string | null }>;
  };
}

export async function fetchSubscriptionPortalUrl(stripeCustomerId: string): Promise<string> {
  const response = await fetch(`${API_BASE}/stripe/portal-session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ stripeCustomerId }),
  });
  const data = await response.json();
  if (!response.ok || !data.ok) throw new Error(data.error || "Portal request failed");
  return data.url as string;
}
