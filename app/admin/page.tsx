"use client";

import { useState } from "react";

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

export default function AdminPage() {
  const [secret, setSecret] = useState("");
  const [email, setEmail] = useState("");
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [triggerStatus, setTriggerStatus] = useState<Record<string, string>>({});

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setOrders([]);
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/admin/orders?email=${encodeURIComponent(email)}&secret=${encodeURIComponent(secret)}`
      );
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Error al buscar");
      setOrders(data.orders);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
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
          <p style={{ color: "#888", fontSize: "13px", margin: "0 0 8px" }}>
            {orders.length} orden(es) encontrada(s) para <strong style={{ color: "#fff" }}>{email}</strong>
          </p>
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
                  <Badge label={o.paymentStatus} color={statusColor(o.paymentStatus)} />
                  <Badge label={o.reportStatus ?? "sin report"} color={statusColor(o.reportStatus)} />
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

function statusColor(status: string | null): string {
  switch (status) {
    case "PAID":      return "#86efac";
    case "DELIVERED": return "#6ee7b7";
    case "PENDING":   return "#fde68a";
    case "FAILED":    return "#f87171";
    case "REFUNDED":  return "#c4b5fd";
    case "GENERATED": return "#93c5fd";
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
