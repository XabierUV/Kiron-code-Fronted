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

type TimerState = {
  startMs: number;
  final: null | { elapsed: string; success: boolean };
};

const PRODUCT_LABELS: Record<string, string> = {
  CHIRON: "La Herida y el Don",
  NATAL_CHART: "Tu Mapa Interior",
  COMPATIBILITY: "El Vínculo",
  SUBSCRIPTION: "Kiron Vivo",
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

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
  const [sendError, setSendError] = useState<Record<string, string>>({});
  const [resetting, setResetting] = useState<Record<string, boolean>>({});
  const [timers, setTimers] = useState<Record<string, TimerState>>({});
  const [, setTick] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const secretRef = useRef(secret);
  const emailRef = useRef(email);
  const timersRef = useRef(timers);

  useEffect(() => { secretRef.current = secret; }, [secret]);
  useEffect(() => { emailRef.current = email; }, [email]);
  useEffect(() => { timersRef.current = timers; }, [timers]);

  const hasRunningTimers = Object.values(timers).some((t) => t.final === null);

  // Tick every second while timers are running
  useEffect(() => {
    if (!hasRunningTimers) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [hasRunningTimers]);

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

  // Finalize timers when orders update (only orders in deps — use ref for timers)
  useEffect(() => {
    if (Object.keys(timersRef.current).length === 0) return;
    setTimers((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const [orderId, timer] of Object.entries(prev)) {
        if (timer.final !== null) continue;
        const order = orders.find((o) => o.orderId === orderId);
        if (!order) continue;
        const done =
          order.reportStatus === "DELIVERED" ||
          order.reportStatus === "ERROR" ||
          order.reportStatus === "FAILED";
        if (done) {
          const elapsed = formatTime(Math.floor((Date.now() - timer.startMs) / 1000));
          next[orderId] = { ...timer, final: { elapsed, success: order.reportStatus === "DELIVERED" } };
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [orders]);

  // Poll every 5s while timers are running (faster than regular auto-refresh)
  useEffect(() => {
    if (!hasRunningTimers) return;
    const id = setInterval(() => fetchOrders(true), 5000);
    return () => clearInterval(id);
  }, [hasRunningTimers, fetchOrders]);

  // Start/stop 30s auto-refresh based on pending orders
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

  async function handleReset(orderId: string) {
    if (!confirm(`¿Resetear orden ${orderId}?\n\nEsto pondrá paymentStatus a PENDING y desvinculará el report.`)) return;
    setResetting((prev) => ({ ...prev, [orderId]: true }));
    try {
      const res = await fetch(`${API_BASE}/admin/reset-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, secret }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Error");
      await fetchOrders(true);
    } catch (err) {
      setSendError((prev) => ({
        ...prev,
        [orderId]: err instanceof Error ? err.message : "error",
      }));
    } finally {
      setResetting((prev) => { const n = { ...prev }; delete n[orderId]; return n; });
    }
  }

  async function handleTrigger(orderId: string) {
    // Start timer immediately on click
    setTimers((prev) => ({ ...prev, [orderId]: { startMs: Date.now(), final: null } }));
    setSendError((prev) => { const n = { ...prev }; delete n[orderId]; return n; });
    try {
      const res = await fetch(`${API_BASE}/admin/trigger-pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, secret }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Error");
      // Timer keeps running — stops only when polling detects DELIVERED or ERROR
    } catch (err) {
      // Network/API error: stop timer and show message
      setTimers((prev) => { const n = { ...prev }; delete n[orderId]; return n; });
      setSendError((prev) => ({
        ...prev,
        [orderId]: err instanceof Error ? err.message : "error",
      }));
    }
  }

  const autoRefreshActive = orders.length > 0 && (hasPendingOrders(orders) || hasRunningTimers);

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
              {orders.length} orden(es) — <strong style={{ color: "#fff" }}>{email}</strong>
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {autoRefreshActive && (
                <span style={{ fontSize: "12px", color: "#fbbf24" }}>
                  {refreshing ? "🔄 Actualizando..." : "🔄 Actualizando automáticamente..."}
                </span>
              )}
              <button
                onClick={() => fetchOrders(true)}
                disabled={refreshing}
                style={{ ...btnStyle, padding: "4px 12px", fontSize: "12px", opacity: refreshing ? 0.6 : 1 }}
              >
                Actualizar ahora
              </button>
            </div>
          </div>

          {orders.map((o) => {
            const timer = timers[o.orderId];
            const isRunning = Boolean(timer && timer.final === null);
            const elapsedSec = timer && !timer.final
              ? Math.floor((Date.now() - timer.startMs) / 1000)
              : 0;
            const netError = sendError[o.orderId];

            return (
              <div key={o.orderId} style={cardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", flexWrap: "wrap" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <span style={{ color: "#fff", fontWeight: 700 }}>
                      {PRODUCT_LABELS[o.productType] ?? o.productType}
                    </span>
                    <span style={{ fontSize: "12px", color: "#888" }}>{o.orderId}</span>
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

                <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                    <button
                      onClick={() => handleTrigger(o.orderId)}
                      style={{ ...btnStyle, opacity: isRunning ? 0.4 : 1, cursor: isRunning ? "not-allowed" : "pointer" }}
                      disabled={isRunning}
                    >
                      Regenerar PDF
                    </button>
                    <button
                      onClick={() => handleReset(o.orderId)}
                      style={{ ...btnStyle, background: "#fb923c", opacity: resetting[o.orderId] ? 0.4 : 1, cursor: resetting[o.orderId] ? "not-allowed" : "pointer" }}
                      disabled={Boolean(resetting[o.orderId])}
                    >
                      {resetting[o.orderId] ? "Reseteando..." : "Resetear orden"}
                    </button>
                    {netError && !timer && (
                      <span style={{ fontSize: "13px", color: "#f87171" }}>✗ {netError}</span>
                    )}
                  </div>

                  {/* Timer: running — show badges + elapsed together */}
                  {isRunning && (
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                      <Badge label={o.paymentStatus} color={paymentColor(o.paymentStatus)} />
                      <Badge label={o.reportStatus ?? "sin report"} color={reportColor(o.reportStatus)} />
                      <span style={{ fontSize: "15px", fontWeight: 700, color: "#fbbf24", letterSpacing: "0.05em" }}>
                        {formatTime(elapsedSec)}
                      </span>
                    </div>
                  )}

                  {/* Timer: final result */}
                  {timer?.final && (
                    <div style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: timer.final.success ? "#86efac" : "#f87171",
                    }}>
                      {timer.final.success
                        ? `✓ Completado en ${timer.final.elapsed}`
                        : `❌ Falló en ${timer.final.elapsed}`}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
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
