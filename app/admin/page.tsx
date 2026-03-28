"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://luminous-patience-production.up.railway.app";

const SECRET_KEY   = "kc_admin_secret";
const DISMISSED_KEY = "kc_admin_dismissed";

type OrderRow = {
  orderId: string;
  customerEmail: string | null;
  galaxyId: string | null;
  customerName: string | null;
  productType: string;
  paymentStatus: string;
  reportStatus: string | null;
  hasPdf: boolean;
  createdAt: string;
  subscriptionStatus?: string | null;
  subscriptionRenewsAt?: string | null;
};

type Tab = "orders" | "subscriptions" | "failures" | "vip" | "comunidad";

type VipRow = OrderRow & { isVip?: boolean };

const VIP_PRODUCT_OPTIONS = [
  { key: "CHIRON",        label: "La Herida y el Don" },
  { key: "NATAL_CHART",   label: "Tu Mapa Interior" },
  { key: "COMPATIBILITY", label: "El Vínculo" },
  { key: "SUBSCRIPTION",  label: "Kiron Vivo" },
];

const PRODUCT_LABELS: Record<string, string> = {
  CHIRON:        "La Herida y el Don",
  NATAL_CHART:   "Tu Mapa Interior",
  COMPATIBILITY: "El Vínculo",
  SUBSCRIPTION:  "Kiron Vivo",
};

function elapsed(from: string): string {
  const sec = Math.floor((Date.now() - new Date(from).getTime()) / 1000);
  if (sec < 60) return `${sec}s`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m ${sec % 60}s`;
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return `${h}h ${m}m`;
}

function problemKey(o: OrderRow): string | null {
  const ageMin = (Date.now() - new Date(o.createdAt).getTime()) / 60000;
  if ((o.reportStatus === "PENDING" || o.reportStatus === "GENERATED") && ageMin > 30)
    return `${o.orderId}:stuck-${o.reportStatus}-${Math.floor(ageMin / 10)}`;
  if (o.subscriptionStatus === "past_due")  return `${o.orderId}:past_due`;
  if (o.subscriptionStatus === "canceled")  return `${o.orderId}:canceled`;
  if (o.paymentStatus === "FAILED")         return `${o.orderId}:payment_failed`;
  if (o.reportStatus === "ERROR" || o.reportStatus === "FAILED")
    return `${o.orderId}:report_error`;
  return null;
}

function problemReason(o: OrderRow): string {
  const ageMin = (Date.now() - new Date(o.createdAt).getTime()) / 60000;
  if ((o.reportStatus === "PENDING" || o.reportStatus === "GENERATED") && ageMin > 30)
    return `Report atascado ${Math.floor(ageMin)}min en ${o.reportStatus}`;
  if (o.subscriptionStatus === "past_due")  return "Suscripción en past_due";
  if (o.subscriptionStatus === "canceled")  return "Suscripción cancelada";
  if (o.paymentStatus === "FAILED")         return "Pago fallido";
  if (o.reportStatus === "ERROR" || o.reportStatus === "FAILED") return "Error en generación de PDF";
  return "";
}

function loadDismissed(): Set<string> {
  try {
    const raw = localStorage.getItem(DISMISSED_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch { return new Set(); }
}

function saveDismissed(set: Set<string>) {
  localStorage.setItem(DISMISSED_KEY, JSON.stringify([...set]));
}

// ── Styles ──────────────────────────────────────────────────────────────────
const S = {
  page: {
    fontFamily: "monospace",
    background: "#0a0a0f",
    color: "#e0e0e0",
    minHeight: "100vh",
    padding: "32px 24px",
    maxWidth: "960px",
    margin: "0 auto",
  } as React.CSSProperties,
  input: {
    background: "#16161f",
    border: "1px solid #333",
    color: "#e0e0e0",
    padding: "8px 12px",
    borderRadius: "4px",
    fontSize: "14px",
    fontFamily: "monospace",
    outline: "none",
    width: "100%",
  } as React.CSSProperties,
  btn: (color = "#fff") => ({
    background: color,
    color: color === "#fff" ? "#0a0a0f" : "#fff",
    border: "none",
    padding: "8px 16px",
    borderRadius: "4px",
    fontSize: "13px",
    fontFamily: "monospace",
    fontWeight: 700,
    cursor: "pointer",
    whiteSpace: "nowrap",
  } as React.CSSProperties),
  card: {
    background: "#16161f",
    border: "1px solid #2a2a35",
    borderRadius: "6px",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  } as React.CSSProperties,
  badge: (color: string) => ({
    display: "inline-block",
    padding: "2px 7px",
    borderRadius: "4px",
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.05em",
    textTransform: "uppercase" as const,
    color: "#0a0a0f",
    background: color,
  }),
  row: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    flexWrap: "wrap" as const,
  },
};

function payColor(s: string | null) {
  if (s === "PAID" || s === "DELIVERED") return "#86efac";
  if (s === "REFUNDED") return "#c4b5fd";
  if (s === "FAILED")   return "#f87171";
  return "#6b7280";
}
function repColor(s: string | null) {
  if (s === "DELIVERED") return "#86efac";
  if (s === "GENERATED") return "#93c5fd";
  if (s === "PENDING")   return "#fb923c";
  if (s === "ERROR" || s === "FAILED") return "#f87171";
  return "#6b7280";
}
function subColor(s: string | null) {
  if (s === "active")   return "#86efac";
  if (s === "past_due") return "#fb923c";
  if (s === "canceled") return "#f87171";
  return "#6b7280";
}

// ── Order Card ───────────────────────────────────────────────────────────────
function OrderCard({
  o, secret, onRefresh,
}: { o: OrderRow; secret: string; onRefresh: () => void }) {
  const [, setTick] = useState(0);
  const [triggering, setTriggering]   = useState(false);
  const [resetting, setResetting]     = useState(false);
  const [delivering, setDelivering]   = useState(false);
  const [err, setErr]                 = useState("");
  const [timerStart, setTimerStart] = useState<number | null>(null);
  const [timerDone, setTimerDone]   = useState<{ elapsed: string; ok: boolean } | null>(null);

  const isActive = o.reportStatus === "PENDING" || o.reportStatus === "GENERATED";

  // Always tick for live elapsed + trigger timers
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // Stop trigger timer when report finishes
  useEffect(() => {
    if (timerStart === null || timerDone) return;
    if (!isActive) {
      const secs = Math.floor((Date.now() - timerStart) / 1000);
      const m = Math.floor(secs / 60), s = secs % 60;
      setTimerDone({
        elapsed: m > 0 ? `${m}m ${s}s` : `${s}s`,
        ok: o.reportStatus === "DELIVERED",
      });
    }
  }, [o.reportStatus, timerStart, timerDone, isActive]);

  async function handleTrigger() {
    setErr(""); setTimerDone(null);
    setTimerStart(Date.now());
    setTriggering(true);
    try {
      const res = await fetch(`${API_BASE}/admin/trigger-pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: o.orderId, secret }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Error");
    } catch (e) {
      setTimerStart(null);
      setErr(e instanceof Error ? e.message : "Error");
    } finally {
      setTriggering(false);
    }
  }

  async function handleForceDeliver() {
    setErr(""); setDelivering(true);
    try {
      const res = await fetch(`${API_BASE}/admin/force-deliver`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: o.orderId, secret }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Error");
      onRefresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error");
    } finally {
      setDelivering(false);
    }
  }

  async function handleReset() {
    if (!confirm(`¿Resetear orden ${o.orderId}? Esto pondrá paymentStatus a PENDING.`)) return;
    setErr(""); setResetting(true);
    try {
      const res = await fetch(`${API_BASE}/admin/reset-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: o.orderId, secret }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Error");
      onRefresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error");
    } finally {
      setResetting(false);
    }
  }

  const pk = problemKey(o);

  return (
    <div style={{ ...S.card, borderColor: pk ? "#7f1d1d" : "#2a2a35" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: "14px" }}>
            {PRODUCT_LABELS[o.productType] ?? o.productType}
          </span>
          {o.customerName  && <span style={{ color: "#a0a0b0", fontSize: "12px" }}>{o.customerName}</span>}
          {o.customerEmail && <span style={{ color: "#888",    fontSize: "12px" }}>{o.customerEmail}</span>}
          {o.galaxyId      && <span style={{ color: "#555",    fontSize: "11px" }}>🌌 {o.galaxyId}</span>}
          <span style={{ color: "#444", fontSize: "11px" }}>{o.orderId}</span>
          <span style={{ color: "#555", fontSize: "11px" }}>
            {new Date(o.createdAt).toLocaleString("es-ES")} — hace {elapsed(o.createdAt)}
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "flex-end" }}>
          <span style={S.badge(payColor(o.paymentStatus))}>{o.paymentStatus}</span>
          <span style={S.badge(repColor(o.reportStatus))}>{o.reportStatus ?? "sin report"}</span>
          {o.hasPdf && <span style={S.badge("#86efac")}>PDF ✓</span>}
          {o.subscriptionStatus && <span style={S.badge(subColor(o.subscriptionStatus))}>{o.subscriptionStatus}</span>}
        </div>
      </div>

      {/* Pending age warning */}
      {isActive && timerStart === null && (
        <div style={{ fontSize: "12px", color: "#fbbf24" }}>
          ⏱ Pendiente hace {elapsed(o.createdAt)}
        </div>
      )}

      {/* Trigger timer */}
      {timerStart !== null && !timerDone && (
        <div style={{ fontSize: "13px", color: "#fbbf24", fontWeight: 700 }}>
          ⏱ Generando... {elapsed(new Date(timerStart).toISOString())}
        </div>
      )}
      {timerDone && (
        <div style={{ fontSize: "13px", fontWeight: 700, color: timerDone.ok ? "#86efac" : "#f87171" }}>
          {timerDone.ok ? `✓ Completado en ${timerDone.elapsed}` : `❌ Falló en ${timerDone.elapsed}`}
        </div>
      )}

      {/* Actions */}
      <div style={S.row}>
        <button onClick={handleTrigger} disabled={triggering} style={S.btn()}>
          {triggering ? "Enviando..." : "Regenerar PDF"}
        </button>
        <button onClick={handleForceDeliver} disabled={delivering} style={S.btn("#818cf8")}>
          {delivering ? "Enviando..." : "Forzar entrega"}
        </button>
        <button onClick={handleReset} disabled={resetting} style={S.btn("#fb923c")}>
          {resetting ? "Reseteando..." : "Resetear orden"}
        </button>
        {err && <span style={{ fontSize: "12px", color: "#f87171" }}>✗ {err}</span>}
      </div>

      {o.subscriptionRenewsAt && (
        <div style={{ fontSize: "11px", color: "#666" }}>
          Próximo cobro: {new Date(o.subscriptionRenewsAt).toLocaleDateString("es-ES")}
        </div>
      )}
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [secret, setSecret]   = useState("");
  const [authed, setAuthed]   = useState(false);
  const [tab, setTab]         = useState<Tab>("orders");
  const [orders, setOrders]   = useState<OrderRow[]>([]);
  const [subs, setSubs]       = useState<OrderRow[]>([]);
  const [vips, setVips]       = useState<VipRow[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  // VIP form
  const [vipEmail, setVipEmail]               = useState("");
  const [vipName, setVipName]                 = useState("");
  const [vipBirthDate, setVipBirthDate]       = useState("");
  const [vipBirthTime, setVipBirthTime]       = useState("");
  const [vipBirthCity, setVipBirthCity]       = useState("");
  const [vipBirthCountry, setVipBirthCountry] = useState("");
  const [vipPersonBName, setVipPersonBName]   = useState("");
  const [vipPersonBDate, setVipPersonBDate]   = useState("");
  const [vipPersonBTime, setVipPersonBTime]   = useState("");
  const [vipPersonBCity, setVipPersonBCity]   = useState("");
  const [vipPersonBCountry, setVipPersonBCountry] = useState("");
  const [vipProducts, setVipProducts]         = useState<string[]>(["CHIRON"]);
  const [vipLoading, setVipLoading]           = useState(false);
  const [vipResult, setVipResult]             = useState<{ galaxyId: string; tempPassword: string | null; isNewAccount: boolean } | null>(null);
  const [vipError, setVipError]               = useState("");

  const [broadcastMsg, setBroadcastMsg]       = useState("");
  const [broadcastLoading, setBroadcastLoading] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState<string | null>(null);
  const secretRef = useRef(secret);
  useEffect(() => { secretRef.current = secret; }, [secret]);

  // Restore auth + dismissed from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(SECRET_KEY);
    if (saved) { setSecret(saved); setAuthed(true); }
    setDismissed(loadDismissed());
  }, []);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    localStorage.setItem(SECRET_KEY, secret);
    setAuthed(true);
  }

  function handleLogout() {
    localStorage.removeItem(SECRET_KEY);
    setSecret(""); setAuthed(false); setOrders([]); setSubs([]);
  }

  function dismiss(key: string) {
    setDismissed((prev) => {
      const next = new Set(prev);
      next.add(key);
      saveDismissed(next);
      return next;
    });
  }

  const fetchOrders = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch(
        `${API_BASE}/admin/recent-orders?secret=${encodeURIComponent(secretRef.current)}`
      );
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Error");
      setOrders(data.orders);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSubs = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch(
        `${API_BASE}/admin/subscriptions?secret=${encodeURIComponent(secretRef.current)}`
      );
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Error");
      setSubs(data.subscriptions);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchVips = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch(
        `${API_BASE}/admin/vip-users?secret=${encodeURIComponent(secretRef.current)}`
      );
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Error");
      setVips(data.vips);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }, []);

  async function handleBroadcast() {
    if (!broadcastMsg.trim()) return;
    setBroadcastLoading(true); setBroadcastResult(null);
    try {
      const res = await fetch(`${API_BASE}/admin/broadcast`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret: secretRef.current, message: broadcastMsg.trim() }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Error");
      setBroadcastResult(`Enviado a ${data.sent ?? "?"} usuarios.`);
      setBroadcastMsg("");
    } catch (e) {
      setBroadcastResult(`Error: ${e instanceof Error ? e.message : "desconocido"}`);
    } finally {
      setBroadcastLoading(false);
    }
  }

  async function handleCreateVip(e: React.FormEvent) {
    e.preventDefault();
    setVipError(""); setVipResult(null); setVipLoading(true);
    try {
      const hasCompatibility = vipProducts.includes("COMPATIBILITY");
      const res = await fetch(`${API_BASE}/admin/create-vip`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret,
          email: vipEmail,
          name: vipName,
          products: vipProducts,
          birthDate: vipBirthDate || undefined,
          birthTime: vipBirthTime || undefined,
          birthCity: vipBirthCity || undefined,
          birthCountry: vipBirthCountry || undefined,
          ...(hasCompatibility && vipPersonBName ? {
            personB: {
              name: vipPersonBName,
              birthDate: vipPersonBDate || undefined,
              birthTime: vipPersonBTime || undefined,
              birthCity: vipPersonBCity || undefined,
              birthCountry: vipPersonBCountry || undefined,
            },
          } : {}),
        }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Error");
      setVipResult({ galaxyId: data.galaxyId, tempPassword: data.tempPassword, isNewAccount: data.isNewAccount });
      setVipEmail(""); setVipName("");
      setVipBirthDate(""); setVipBirthTime(""); setVipBirthCity(""); setVipBirthCountry("");
      setVipPersonBName(""); setVipPersonBDate(""); setVipPersonBTime(""); setVipPersonBCity(""); setVipPersonBCountry("");
      setVipProducts(["CHIRON"]);
      fetchVips();
    } catch (e) {
      setVipError(e instanceof Error ? e.message : "Error");
    } finally {
      setVipLoading(false);
    }
  }

  function toggleVipProduct(key: string) {
    setVipProducts((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  useEffect(() => {
    if (!authed) return;
    if (tab === "orders")         fetchOrders();
    if (tab === "subscriptions")  fetchSubs();
    if (tab === "failures") { fetchOrders(); fetchSubs(); }
    if (tab === "vip")            fetchVips();
  }, [authed, tab, fetchOrders, fetchSubs, fetchVips]);

  // ── Login screen ──────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div style={{ ...S.page, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: "100%", maxWidth: "360px" }}>
          <h1 style={{ fontSize: "18px", marginBottom: "24px", color: "#fff" }}>Kiron Admin</h1>
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <input
              type="password"
              placeholder="Contraseña"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              required
              autoFocus
              style={S.input}
            />
            <button type="submit" style={S.btn()}>Entrar</button>
          </form>
        </div>
      </div>
    );
  }

  // Compute failures from all loaded data
  const allOrders = [...new Map([...orders, ...subs].map((o) => [o.orderId, o])).values()];
  const failures = allOrders
    .map((o) => ({ o, key: problemKey(o), reason: problemReason(o) }))
    .filter(({ key }) => key !== null && !dismissed.has(key!))
    .sort((a, b) => new Date(b.o.createdAt).getTime() - new Date(a.o.createdAt).getTime());

  // ── Authenticated UI ──────────────────────────────────────────────────────
  return (
    <div style={S.page}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
        <h1 style={{ fontSize: "18px", color: "#fff", margin: 0 }}>Kiron Admin</h1>
        <button onClick={handleLogout} style={{ ...S.btn("#333"), fontSize: "12px", padding: "6px 12px" }}>
          Cerrar sesión
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "24px", borderBottom: "1px solid #2a2a35" }}>
        {(["orders", "subscriptions", "failures", "vip", "comunidad"] as Tab[]).map((t) => {
          const labels: Record<Tab, string> = {
            orders:        `Órdenes${orders.length ? ` (${orders.length})` : ""}`,
            subscriptions: `Kiron Vivo${subs.length ? ` (${subs.length})` : ""}`,
            failures:      `Fallos${failures.length ? ` 🔴${failures.length}` : ""}`,
            vip:           `VIP${vips.length ? ` (${vips.length})` : ""}`,
            comunidad:     "Comunidad",
          };
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                background: "none",
                border: "none",
                borderBottom: tab === t ? "2px solid #fff" : "2px solid transparent",
                color: tab === t ? "#fff" : "#666",
                padding: "8px 16px",
                fontFamily: "monospace",
                fontSize: "13px",
                fontWeight: tab === t ? 700 : 400,
                cursor: "pointer",
                marginBottom: "-1px",
              }}
            >
              {labels[t]}
            </button>
          );
        })}
      </div>

      {error && <p style={{ color: "#f87171", fontSize: "13px", marginBottom: "16px" }}>✗ {error}</p>}

      {/* ── Órdenes ────────────────────────────────────────────────────────── */}
      {tab === "orders" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <p style={{ color: "#666", fontSize: "12px", margin: 0 }}>
              {orders.length} orden(es) — más recientes primero
            </p>
            <button onClick={fetchOrders} disabled={loading} style={{ ...S.btn(), padding: "6px 12px", fontSize: "12px" }}>
              {loading ? "Cargando..." : "Actualizar"}
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {orders.map((o) => (
              <OrderCard key={o.orderId} o={o} secret={secret} onRefresh={fetchOrders} />
            ))}
            {orders.length === 0 && !loading && (
              <p style={{ color: "#555", fontSize: "13px" }}>Sin órdenes.</p>
            )}
          </div>
        </div>
      )}

      {/* ── Suscripciones ──────────────────────────────────────────────────── */}
      {tab === "subscriptions" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <p style={{ color: "#666", fontSize: "12px", margin: 0 }}>
              {subs.length} suscripción(es)
            </p>
            <button onClick={fetchSubs} disabled={loading} style={{ ...S.btn(), padding: "6px 12px", fontSize: "12px" }}>
              {loading ? "Actualizando..." : "Actualizar"}
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {subs.map((o) => (
              <OrderCard key={o.orderId} o={o} secret={secret} onRefresh={fetchSubs} />
            ))}
            {subs.length === 0 && !loading && (
              <p style={{ color: "#555", fontSize: "13px" }}>No hay suscripciones.</p>
            )}
          </div>
        </div>
      )}

      {/* ── Fallos ─────────────────────────────────────────────────────────── */}
      {tab === "failures" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <p style={{ color: "#666", fontSize: "12px", margin: 0 }}>
              Reports atascados &gt;30min · pagos fallidos · suscripciones con problemas
            </p>
            <button
              onClick={() => { fetchOrders(); fetchSubs(); }}
              disabled={loading}
              style={{ ...S.btn(), padding: "6px 12px", fontSize: "12px" }}
            >
              {loading ? "Actualizando..." : "Actualizar"}
            </button>
          </div>

          {failures.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {failures.map(({ o, key, reason }) => (
                <div key={key}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <span style={{ fontSize: "11px", color: "#f87171" }}>⚠ {reason}</span>
                    <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "11px", color: "#666" }}>
                      <input
                        type="checkbox"
                        onChange={() => dismiss(key!)}
                        style={{ cursor: "pointer" }}
                      />
                      Marcar como visto
                    </label>
                  </div>
                  <OrderCard o={o} secret={secret} onRefresh={() => { fetchOrders(); fetchSubs(); }} />
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "#555", fontSize: "13px" }}>
              {allOrders.length === 0 ? "Cargando datos..." : "Sin fallos detectados."}
            </p>
          )}
        </div>
      )}

      {/* ── VIP ────────────────────────────────────────────────────────────── */}
      {tab === "vip" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          {/* Create VIP form */}
          <div style={S.card}>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: "14px", marginBottom: "4px" }}>Crear acceso VIP</div>
            <form onSubmit={handleCreateVip} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {/* Persona A */}
              <div style={{ color: "#888", fontSize: "11px", letterSpacing: "0.05em", textTransform: "uppercase" }}>Persona A</div>
              <input style={S.input} type="text" placeholder="Nombre completo" value={vipName} onChange={(e) => setVipName(e.target.value)} />
              <input style={S.input} type="email" placeholder="Email *" value={vipEmail} onChange={(e) => setVipEmail(e.target.value)} required />
              <div style={{ display: "flex", gap: "8px" }}>
                <input style={{ ...S.input, flex: 1 }} type="date" placeholder="Fecha nacimiento" value={vipBirthDate} onChange={(e) => setVipBirthDate(e.target.value)} />
                <input style={{ ...S.input, width: "110px", flex: "none" }} type="time" placeholder="Hora" value={vipBirthTime} onChange={(e) => setVipBirthTime(e.target.value)} />
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <input style={{ ...S.input, flex: 1 }} type="text" placeholder="Ciudad de nacimiento" value={vipBirthCity} onChange={(e) => setVipBirthCity(e.target.value)} />
                <input style={{ ...S.input, flex: 1 }} type="text" placeholder="País" value={vipBirthCountry} onChange={(e) => setVipBirthCountry(e.target.value)} />
              </div>

              {/* Products */}
              <div style={{ color: "#888", fontSize: "11px", letterSpacing: "0.05em", textTransform: "uppercase", marginTop: "4px" }}>Productos</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                {VIP_PRODUCT_OPTIONS.map(({ key, label }) => (
                  <label key={key} style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "13px", color: "#ccc" }}>
                    <input type="checkbox" checked={vipProducts.includes(key)} onChange={() => toggleVipProduct(key)} style={{ cursor: "pointer" }} />
                    {label}
                  </label>
                ))}
              </div>

              {/* Persona B (solo si COMPATIBILITY está seleccionado) */}
              {vipProducts.includes("COMPATIBILITY") && (
                <>
                  <div style={{ color: "#888", fontSize: "11px", letterSpacing: "0.05em", textTransform: "uppercase", marginTop: "4px" }}>Persona B (El Vínculo)</div>
                  <input style={S.input} type="text" placeholder="Nombre persona B" value={vipPersonBName} onChange={(e) => setVipPersonBName(e.target.value)} />
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input style={{ ...S.input, flex: 1 }} type="date" placeholder="Fecha nacimiento B" value={vipPersonBDate} onChange={(e) => setVipPersonBDate(e.target.value)} />
                    <input style={{ ...S.input, width: "110px", flex: "none" }} type="time" placeholder="Hora B" value={vipPersonBTime} onChange={(e) => setVipPersonBTime(e.target.value)} />
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input style={{ ...S.input, flex: 1 }} type="text" placeholder="Ciudad B" value={vipPersonBCity} onChange={(e) => setVipPersonBCity(e.target.value)} />
                    <input style={{ ...S.input, flex: 1 }} type="text" placeholder="País B" value={vipPersonBCountry} onChange={(e) => setVipPersonBCountry(e.target.value)} />
                  </div>
                </>
              )}

              <div style={S.row}>
                <button type="submit" disabled={vipLoading || vipProducts.length === 0} style={S.btn("#c4b5fd")}>
                  {vipLoading ? "Creando..." : "Crear acceso VIP"}
                </button>
                {vipError && <span style={{ fontSize: "12px", color: "#f87171" }}>✗ {vipError}</span>}
              </div>
            </form>
            {vipResult && (
              <div style={{ marginTop: "8px", padding: "12px", background: "#0d2d1a", border: "1px solid #166534", borderRadius: "4px", fontSize: "13px" }}>
                <div style={{ color: "#86efac", fontWeight: 700, marginBottom: "6px" }}>
                  ✓ {vipResult.isNewAccount ? "Cuenta creada" : "Acceso añadido a cuenta existente"}
                </div>
                <div style={{ color: "#a0a0b0" }}>Galaxy ID: <strong style={{ color: "#fff" }}>{vipResult.galaxyId}</strong></div>
                {vipResult.tempPassword && (
                  <div style={{ color: "#a0a0b0", marginTop: "4px" }}>
                    Contraseña temporal: <strong style={{ color: "#fbbf24" }}>{vipResult.tempPassword}</strong>
                    <span style={{ color: "#666", fontSize: "11px", marginLeft: "8px" }}>(el usuario puede cambiarla)</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* VIP list */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <span style={{ color: "#666", fontSize: "12px" }}>{vips.length} acceso(s) VIP</span>
              <button onClick={fetchVips} disabled={loading} style={{ ...S.btn(), padding: "6px 12px", fontSize: "12px" }}>
                {loading ? "Cargando..." : "Actualizar"}
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {vips.map((o) => (
                <OrderCard key={o.orderId} o={o} secret={secret} onRefresh={fetchVips} />
              ))}
              {vips.length === 0 && !loading && (
                <p style={{ color: "#555", fontSize: "13px" }}>No hay usuarios VIP todavía.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Comunidad ──────────────────────────────────────────────────────── */}
      {tab === "comunidad" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={S.card}>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: "14px", marginBottom: "4px" }}>
              Enviar mensaje a la comunidad
            </div>
            <textarea
              style={{ ...S.input, minHeight: "120px", resize: "vertical" }}
              placeholder="Escribe el mensaje que recibirán todos los usuarios..."
              value={broadcastMsg}
              onChange={(e) => setBroadcastMsg(e.target.value)}
            />
            <button
              onClick={handleBroadcast}
              disabled={broadcastLoading}
              style={{ ...S.btn(), alignSelf: "flex-start", opacity: broadcastLoading ? 0.6 : 1 }}
            >
              {broadcastLoading ? "Enviando..." : "Enviar a todos"}
            </button>
            {broadcastResult !== null && (
              <p style={{
                fontSize: "13px",
                color: broadcastResult.startsWith("Error") ? "#f87171" : "#86efac",
                margin: 0,
              }}>
                {broadcastResult}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
