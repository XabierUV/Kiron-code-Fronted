"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://luminous-patience-production.up.railway.app";

type OrderRow = {
  orderId: string;
  productType: string;
  paymentStatus: string;
  reportStatus: string | null;
  pdfUrl: string | null;
  createdAt: string;
};

const PRODUCT_LABELS: Record<string, string> = {
  CHIRON: "La Herida y el Don",
  NATAL_CHART: "Tu Mapa Interior",
  COMPATIBILITY: "El Vínculo",
  SUBSCRIPTION: "Kiron Vivo",
};

function hasPendingOrders(orders: OrderRow[]): boolean {
  return orders.some(
    (o) => o.reportStatus === "PENDING" || o.reportStatus === "GENERATED"
  );
}

export default function AdminPage() {
  const [secret, setSecret] = useState("");
  const [email, setEmail] = useState("");
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [triggerStatus, setTriggerStatus] = useState<Record<string, string>>({});
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const secretRef = useRef(secret);
  const emailRef = useRef(email);

  useEffect(() => { secretRef.current = secret; }, [secret]);
  useEffect(() => { emailRef.current = email; }, [email]);

  const fetchOrders = useCallback(async (isAuto = false) => {
    if (isAuto) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/admin/orders?email=${encodeURIComponent(emailRef.current)}&secret=${encodeURIComponent(secretRef.current)}`
      );
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Error al buscar");
      setOrders(data.orders);
      setError("");
      return data.orders as OrderRow[];
    } catch (err) {
      if (!isAuto) setError(err instanceof Error ? err.message : "Error desconocido");
      return null;
    } finally {
      if (isAuto) setRefreshing(false);
      else setLoading(false);
    }
  }, []);

  // Start/stop auto-refresh based on pending orders
  useEffect(() => {
    if (orders.length === 0) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    if (hasPendingOrders(orders)) {
      if (!intervalRef.current) {
        intervalRef.current = setInterval(async () => {
          const updated = await fetchOrders(true);
          if (updated && !hasPendingOrders(updated)) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }, 30000);
      }
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [orders, fetchOrders]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setOrders([]);
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    await fetchOrders(false);
  }

  async function handleRefreshNow() {
    await fetchOrders(true);
  }

  async function handleTrigger(orderId: string) {
    setTriggerStatus((s) => ({ ...s, [orderId]: "enviando..." }));
    try {
      const res = await fetch(`${API_BASE}/admin/trigger-pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, secret }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Error");
      setTriggerStatus((s) => ({ ...s, [orderId]: `✓ disparado (${data.productType})` }));
    } catch (err) {
      setTriggerStatus((s) => ({
        ...s,
        [orderId]: `✗ ${err instanceof Error ? err.message : "error"}`,
      }));
    }
  }

  const autoRefreshActive = orders.length > 0 && hasPendingOrders(orders);

  return (
    <div style={{
      fontFamily: "monospace",
      background: "#0a0a0f",
      color: "#e0e0e0",
      minHeight: "100vh",
      padding: "32px",
      maxWidth: "900px",
      margin: "0 auto",
    }}>
      <h1 style={{ fontSize: "20px", marginBottom: "24px", color: "#fff" }}>
        Kiron Admin
      </h1>

      <form onSubmit={handleSearch} style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "32px" }}>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <input
            type="password"
            placeholder="ADMIN_SECRET"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            required
            style={inputStyle}
          />
          <input
            type="email"
            placeholder="email del cliente"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ ...inputStyle, minWidth: "260px" }}
          />
          <button type="submit" disabled={loading} style={btnStyle}>
            {loading ? "Buscando..." : "Buscar"}
          </button>
        </div>
        {error && <p style={{ color: "#f87171", margin: 0, fontSize: "14px" }}>{error}</p>}
      </form>

      {orders.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "8px", flexWrap: "wrap" }}>
            <p style={{ color: "#888", fontSize: "13px", margin: 0 }}>
              {orders.length} orden(es) encontrada(s) para <strong style={{ color: "#fff" }}>{email}</strong>
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {autoRefreshActive && (
                <span style={{ fontSize: "12px", color: "#fbbf24" }}>
                  {refreshing ? "🔄 Actualizando..." : "🔄 Actualizando automáticamente..."}
                </span>
              )}
              <button
                onClick={handleRefreshNow}
                disabled={refreshing}
                style={{ ...btnStyle, padding: "4px 12px", fontSize: "12px", opacity: refreshing ? 0.6 : 1 }}
              >
                Actualizar ahora
              </button>
            </div>
          </div>

          {orders.map((o) => (
            <div key={o.orderId} style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", flexWrap: "wrap" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <span style={{ color: "#fff", fontWeight: 700 }}>
                    {PRODUCT_LABELS[o.productType] ?? o.productType}
                  </span>
                  <span style={{ fontSize: "12px", color: "#888" }}>
                    {o.orderId}
                  </span>
                  <span style={{ fontSize: "12px", color: "#888" }}>
                    {new Date(o.createdAt).toLocaleString("es-ES")}
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px", textAlign: "right" }}>
                  <Badge label={o.paymentStatus} color={paymentColor(o.paymentStatus)} />
                  <Badge label={o.reportStatus ?? "sin report"} color={reportColor(o.reportStatus)} />
                  {o.pdfUrl && <Badge label="PDF ✓" color="#86efac" />}
                </div>
              </div>
              <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "12px" }}>
                <button
                  onClick={() => handleTrigger(o.orderId)}
                  style={btnStyle}
                  disabled={triggerStatus[o.orderId] === "enviando..."}
                >
                  Regenerar PDF
                </button>
                {triggerStatus[o.orderId] && (
                  <span style={{ fontSize: "13px", color: triggerStatus[o.orderId].startsWith("✓") ? "#86efac" : "#f87171" }}>
                    {triggerStatus[o.orderId]}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {orders.length === 0 && !loading && !error && email && (
        <p style={{ color: "#888" }}>No se encontraron órdenes.</p>
      )}
    </div>
  );
}

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span style={{
      display: "inline-block",
      padding: "2px 8px",
      borderRadius: "4px",
      fontSize: "11px",
      fontWeight: 700,
      letterSpacing: "0.05em",
      textTransform: "uppercase",
      color: "#0a0a0f",
      background: color,
    }}>
      {label}
    </span>
  );
}

function paymentColor(status: string | null): string {
  switch (status) {
    case "PAID":      return "#86efac";
    case "DELIVERED": return "#86efac";
    case "REFUNDED":  return "#c4b5fd";
    case "FAILED":    return "#f87171";
    case "PENDING":
    default:          return "#6b7280";
  }
}

function reportColor(status: string | null): string {
  switch (status) {
    case "DELIVERED": return "#86efac";
    case "GENERATED": return "#93c5fd";
    case "PENDING":   return "#fb923c";
    case "ERROR":
    case "FAILED":    return "#f87171";
    default:          return "#6b7280";
  }
}

const inputStyle: React.CSSProperties = {
  background: "#16161f",
  border: "1px solid #333",
  color: "#e0e0e0",
  padding: "8px 12px",
  borderRadius: "4px",
  fontSize: "14px",
  fontFamily: "monospace",
  outline: "none",
};

const btnStyle: React.CSSProperties = {
  background: "#fff",
  color: "#0a0a0f",
  border: "none",
  padding: "8px 16px",
  borderRadius: "4px",
  fontSize: "14px",
  fontFamily: "monospace",
  fontWeight: 700,
  cursor: "pointer",
};

const cardStyle: React.CSSProperties = {
  background: "#16161f",
  border: "1px solid #2a2a35",
  borderRadius: "6px",
  padding: "16px",
};
