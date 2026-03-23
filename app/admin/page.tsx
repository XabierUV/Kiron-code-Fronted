"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://luminous-patience-production.up.railway.app";

const SECRET_KEY = "kc_admin_secret";

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

type Tab = "search" | "subscriptions" | "failures";

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

function isProblem(o: OrderRow): { yes: boolean; reason: string } {
  const ageMin = (Date.now() - new Date(o.createdAt).getTime()) / 60000;
  if ((o.reportStatus === "PENDING" || o.reportStatus === "GENERATED") && ageMin > 30) {
    return { yes: true, reason: `Report atascado ${Math.floor(ageMin)}min en ${o.reportStatus}` };
  }
  if (o.subscriptionStatus === "past_due") return { yes: true, reason: "Suscripción en past_due" };
  if (o.subscriptionStatus === "canceled") return { yes: true, reason: "Suscripción cancelada" };
  if (o.paymentStatus === "FAILED") return { yes: true, reason: "Pago fallido" };
  return { yes: false, reason: "" };
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
  label: { color: "#666", fontSize: "11px" } as React.CSSProperties,
  value: { color: "#ccc", fontSize: "12px" } as React.CSSProperties,
};

function payColor(s: string | null) {
  if (s === "PAID" || s === "DELIVERED") return "#86efac";
  if (s === "REFUNDED") return "#c4b5fd";
  if (s === "FAILED") return "#f87171";
  return "#6b7280";
}
function repColor(s: string | null) {
  if (s === "DELIVERED") return "#86efac";
  if (s === "GENERATED") return "#93c5fd";
  if (s === "PENDING") return "#fb923c";
  if (s === "ERROR" || s === "FAILED") return "#f87171";
  return "#6b7280";
}
function subColor(s: string | null) {
  if (s === "active") return "#86efac";
  if (s === "past_due") return "#fb923c";
  if (s === "canceled") return "#f87171";
  return "#6b7280";
}

// ── Order Card ───────────────────────────────────────────────────────────────
function OrderCard({
  o, secret, onRefresh,
}: { o: OrderRow; secret: string; onRefresh: () => void }) {
  const [, setTick] = useState(0);
  const [triggering, setTriggering] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [err, setErr] = useState("");
  const [timerStart, setTimerStart] = useState<number | null>(null);
  const [timerDone, setTimerDone] = useState<{ elapsed: string; ok: boolean } | null>(null);

  const isActive = o.reportStatus === "PENDING" || o.reportStatus === "GENERATED";
  const ageMin = (Date.now() - new Date(o.createdAt).getTime()) / 60000;
  const problem = isProblem(o);

  // Tick every second for live timers
  useEffect(() => {
    if (!isActive && timerStart === null) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [isActive, timerStart]);

  // Stop timer when report is done
  useEffect(() => {
    if (timerStart === null || timerDone) return;
    if (!isActive) {
      setTimerDone({
        elapsed: elapsed(new Date(Date.now() - timerStart).toISOString()),
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

  return (
    <div style={{ ...S.card, borderColor: problem.yes ? "#7f1d1d" : "#2a2a35" }}>
      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: "14px" }}>
            {PRODUCT_LABELS[o.productType] ?? o.productType}
          </span>
          {o.customerName && <span style={{ color: "#a0a0b0", fontSize: "12px" }}>{o.customerName}</span>}
          {o.customerEmail && <span style={{ color: "#888", fontSize: "12px" }}>{o.customerEmail}</span>}
          {o.galaxyId && <span style={{ color: "#555", fontSize: "11px" }}>🌌 {o.galaxyId}</span>}
          <span style={{ color: "#444", fontSize: "11px" }}>{o.orderId}</span>
          <span style={{ color: "#555", fontSize: "11px" }}>
            {new Date(o.createdAt).toLocaleString("es-ES")}
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "flex-end" }}>
          <span style={S.badge(payColor(o.paymentStatus))}>{o.paymentStatus}</span>
          <span style={S.badge(repColor(o.reportStatus))}>{o.reportStatus ?? "sin report"}</span>
          {o.hasPdf && <span style={S.badge("#86efac")}>PDF ✓</span>}
          {o.subscriptionStatus && <span style={S.badge(subColor(o.subscriptionStatus))}>{o.subscriptionStatus}</span>}
          {problem.yes && <span style={{ fontSize: "10px", color: "#f87171" }}>⚠ {problem.reason}</span>}
        </div>
      </div>

      {/* Live creation timer */}
      {isActive && timerStart === null && (
        <div style={{ fontSize: "12px", color: "#fbbf24" }}>
          ⏱ Pendiente hace {elapsed(o.createdAt)}
          {ageMin > 30 && <span style={{ color: "#f87171", marginLeft: "8px" }}>— más de 30 min</span>}
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
        <button onClick={handleReset} disabled={resetting} style={S.btn("#fb923c")}>
          {resetting ? "Reseteando..." : "Resetear orden"}
        </button>
        {err && <span style={{ fontSize: "12px", color: "#f87171" }}>✗ {err}</span>}
      </div>

      {/* Subscription renewal */}
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
  const [secret, setSecret] = useState("");
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<Tab>("search");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<OrderRow[]>([]);
  const [subs, setSubs] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const secretRef = useRef(secret);
  useEffect(() => { secretRef.current = secret; }, [secret]);

  // Restore secret from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(SECRET_KEY);
    if (saved) { setSecret(saved); setAuthed(true); }
  }, []);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    localStorage.setItem(SECRET_KEY, secret);
    setAuthed(true);
  }

  function handleLogout() {
    localStorage.removeItem(SECRET_KEY);
    setSecret(""); setAuthed(false); setResults([]); setSubs([]);
  }

  const fetchSubs = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API_BASE}/admin/subscriptions?secret=${encodeURIComponent(secretRef.current)}`);
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Error");
      setSubs(data.subscriptions);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }, []);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true); setError(""); setResults([]);
    try {
      const res = await fetch(
        `${API_BASE}/admin/search?q=${encodeURIComponent(query.trim())}&secret=${encodeURIComponent(secret)}`
      );
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Error");
      setResults(data.orders);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (authed && tab === "subscriptions") fetchSubs();
  }, [authed, tab, fetchSubs]);

  // ── Login screen ───────────────────────────────────────────────────────────
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

  // ── Failures ───────────────────────────────────────────────────────────────
  const allOrders = [...results, ...subs];
  const failures = allOrders.filter((o) => isProblem(o).yes);
  const uniqueFailures = [...new Map(failures.map((o) => [o.orderId, o])).values()];

  // ── Authenticated UI ───────────────────────────────────────────────────────
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
      <div style={{ display: "flex", gap: "4px", marginBottom: "24px", borderBottom: "1px solid #2a2a35", paddingBottom: "0" }}>
        {(["search", "subscriptions", "failures"] as Tab[]).map((t) => {
          const labels: Record<Tab, string> = {
            search: "Búsqueda",
            subscriptions: `Kiron Vivo${subs.length ? ` (${subs.length})` : ""}`,
            failures: `Ver Fallos${uniqueFailures.length ? ` 🔴${uniqueFailures.length}` : ""}`,
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

      {/* ── Búsqueda tab ─────────────────────────────────────────────────────── */}
      {tab === "search" && (
        <div>
          <form onSubmit={handleSearch} style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
            <input
              type="text"
              placeholder="email, orderId, Galaxy ID, nombre..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ ...S.input, flex: 1 }}
              autoFocus
            />
            <button type="submit" disabled={loading} style={S.btn()}>
              {loading ? "Buscando..." : "Buscar"}
            </button>
          </form>
          {results.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <p style={{ color: "#666", fontSize: "12px", margin: "0 0 4px 0" }}>
                {results.length} resultado(s)
              </p>
              {results.map((o) => (
                <OrderCard key={o.orderId} o={o} secret={secret} onRefresh={() => handleSearch({ preventDefault: () => {} } as React.FormEvent)} />
              ))}
            </div>
          )}
          {results.length === 0 && !loading && query && (
            <p style={{ color: "#555", fontSize: "13px" }}>Sin resultados.</p>
          )}
        </div>
      )}

      {/* ── Kiron Vivo tab ───────────────────────────────────────────────────── */}
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

      {/* ── Fallos tab ───────────────────────────────────────────────────────── */}
      {tab === "failures" && (
        <div>
          <p style={{ color: "#666", fontSize: "12px", marginBottom: "16px" }}>
            Reports atascados &gt;30min, pagos fallidos, suscripciones con problemas.
            <br />
            <span style={{ color: "#555" }}>Busca primero en las otras pestañas para cargar datos.</span>
          </p>
          {uniqueFailures.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {uniqueFailures.map((o) => {
                const { reason } = isProblem(o);
                return (
                  <div key={o.orderId}>
                    <p style={{ color: "#f87171", fontSize: "11px", marginBottom: "4px" }}>⚠ {reason}</p>
                    <OrderCard o={o} secret={secret} onRefresh={fetchSubs} />
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ color: "#555", fontSize: "13px" }}>
              {allOrders.length === 0 ? "Carga datos desde Búsqueda o Kiron Vivo primero." : "Sin fallos detectados."}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
