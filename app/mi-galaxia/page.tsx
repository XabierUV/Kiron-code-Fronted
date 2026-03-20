"use client";

import { useState, useEffect } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { sendMagicLink, fetchCustomerPortal, createCheckout } from "@/lib/api";
import type { Lang } from "@/types/chart";
import { ConsentModal, type ConsentData } from "@/components/consent-modal";
import { VinculoConfigModal, type VinculoData } from "@/components/vinculo-config-modal";

type PurchasedProduct = {
  productType: string;
  pdfUrl?: string | null;
  avatarUrl?: string | null;
  chartUrl?: string | null;
};

type PortalData = {
  name: string;
  chartId: string;
  reportId: string;
  chiron: {
    sign: string;
    house: number;
    degree: number;
  };
  products: PurchasedProduct[];
};

type CatalogItem = {
  key: string;
  name: string;
  price: string;
  requiresKey: string | null;
};

const CATALOG: CatalogItem[] = [
  { key: "CHIRON",        name: "La Herida y el Don",  price: "19€",     requiresKey: null },
  { key: "NATAL_CHART",   name: "Tu Mapa Interior",    price: "39€",     requiresKey: "CHIRON" },
  { key: "COMPATIBILITY", name: "El Vínculo",          price: "59€",     requiresKey: "NATAL_CHART" },
  { key: "SUBSCRIPTION",  name: "Kiron Vivo",          price: "9€/mes",  requiresKey: null },
];

function dedupe(products: PurchasedProduct[]): Map<string, PurchasedProduct> {
  const map = new Map<string, PurchasedProduct>();
  for (const p of products) {
    if (!map.has(p.productType)) map.set(p.productType, p);
  }
  return map;
}

export default function MiCartaPage() {
  const [lang, setLang] = useState<Lang>("es");
  const [scrolled, setScrolled] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState("");
  const [portalData, setPortalData] = useState<PortalData | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [pendingPortalCheckout, setPendingPortalCheckout] = useState<{ productType: string; chartId: string; reportId: string } | null>(null);
  const [vinculoStep, setVinculoStep] = useState(false);
  const [vinculoData, setVinculoData] = useState<VinculoData | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    if (t) {
      setToken(t);
      setPortalLoading(true);
      fetchCustomerPortal(t)
        .then((data) => setPortalData(data))
        .catch((err) =>
          setPortalError(
            err instanceof Error ? err.message : "No se pudo cargar tu carta."
          )
        )
        .finally(() => setPortalLoading(false));
    }
  }, []);

  async function handleSendLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSending(true);
    setSendError("");
    try {
      await sendMagicLink(email.trim());
      setSent(true);
    } catch (err) {
      setSendError(
        err instanceof Error ? err.message : "Ha ocurrido un error. Inténtalo de nuevo."
      );
    } finally {
      setSending(false);
    }
  }

  async function handlePortalCheckout(productType: string, chartId: string, reportId: string, consentData?: ConsentData) {
    setCheckoutLoading(productType);
    try {
      const vd = vinculoData;
      const checkout = await createCheckout({
        chartId,
        reportId,
        productType: productType as "CHIRON" | "NATAL_CHART" | "COMPATIBILITY" | "SUBSCRIPTION",
        deliveryEmail: consentData?.deliveryEmail,
        marketingConsent: consentData?.marketingConsent,
        ...(vd && {
          vinculoRelationship: vd.relationship,
          vinculoPersonBId: vd.personBId,
          vinculoPerson2Name: vd.person2Name,
          vinculoPerson2BirthDate: vd.person2BirthDate,
          vinculoPerson2BirthTime: vd.person2BirthTime,
          vinculoPerson2BirthCity: vd.person2BirthCity,
        }),
      });
      if (checkout.checkoutUrl) {
        window.location.href = checkout.checkoutUrl;
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error iniciando el pago.");
    } finally {
      setCheckoutLoading(null);
    }
  }

  return (
    <div className="pageShell" id="top">
      <SiteHeader
        lang={lang}
        setLang={setLang}
        scrolled={scrolled}
        onNavigate={(id) => { window.location.href = `/#${id}`; }}
      />

      <main className="pageContent">
        <section className="contentSection">
          <div className="sectionIntro">
            <p className="sectionLabel">Portal</p>
            <h1 className="sectionTitle">Mi galaxia.</h1>
            <p className="sectionText">
              {token
                ? "Tu carta natal y tus informes."
                : "Accede a tu carta natal y a todos tus informes."}
            </p>
          </div>

          <div className="resultsPanel">
            {/* ── No token: email form ── */}
            {!token && (
              <>
                {sent ? (
                  <article className="insightCard">
                    <h3>Enlace enviado</h3>
                    <p>
                      Te hemos enviado un enlace de acceso a tu email. Revisa tu bandeja de entrada (y la carpeta de spam).
                    </p>
                  </article>
                ) : (
                  <article className="insightCard">
                    <h3>Acceder a mi galaxia</h3>
                    <p style={{ marginBottom: "20px" }}>
                      Introduce el email que usaste al generar tu carta natal. Te enviaremos un enlace de acceso directo.
                    </p>
                    <form onSubmit={handleSendLink} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      <div>
                        <label htmlFor="portal-email" className="fieldLabel">
                          Correo electrónico
                        </label>
                        <input
                          id="portal-email"
                          type="email"
                          className="fieldInput"
                          placeholder="tu@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          autoComplete="email"
                        />
                      </div>
                      {sendError && (
                        <p style={{ color: "rgba(255,80,80,0.9)", fontSize: "14px", margin: 0 }}>
                          {sendError}
                        </p>
                      )}
                      <div>
                        <button type="submit" className="primaryButton" disabled={sending}>
                          {sending ? "Enviando..." : "Acceder a mi galaxia"}
                        </button>
                      </div>
                    </form>
                  </article>
                )}
              </>
            )}

            {/* ── Token: loading ── */}
            {token && portalLoading && (
              <article className="insightCard">
                <h3>Cargando tu carta...</h3>
                <p>Verificando acceso y recuperando tu información.</p>
              </article>
            )}

            {/* ── Token: error ── */}
            {token && portalError && (
              <article className="insightCard">
                <h3>No se pudo acceder</h3>
                <p>{portalError}</p>
                <p style={{ marginTop: "12px" }}>
                  <button
                    type="button"
                    className="secondaryButton"
                    onClick={() => { window.location.href = "/mi-galaxia"; }}
                    style={{ minHeight: "40px", padding: "0 16px", fontSize: "14px" }}
                  >
                    Volver a acceder
                  </button>
                </p>
              </article>
            )}

            {/* ── Token: portal data ── */}
            {token && portalData && (() => {
              const purchased = dedupe(portalData.products);

              return (
                <>
                  <article className="insightCard">
                    <h3>Hola, {portalData.name}.</h3>
                    <p>
                      Tu <strong>Quirón</strong> está en{" "}
                      <strong>{portalData.chiron.sign}</strong>, Casa {portalData.chiron.house},{" "}
                      a {portalData.chiron.degree.toFixed(1)}°.
                    </p>
                  </article>

                  {CATALOG.map((item) => {
                    const p = purchased.get(item.key);
                    const isPurchased = Boolean(p);
                    const isBlocked = !isPurchased && item.requiresKey !== null && !purchased.has(item.requiresKey);
                    const isAvailable = !isPurchased && !isBlocked;
                    const isMapaInterior = item.key === "NATAL_CHART";

                    let badge: { label: string; color: string } | null = null;
                    if (isPurchased) badge = { label: "Comprado", color: "rgba(100,220,130,0.9)" };
                    else if (isBlocked) badge = { label: "Bloqueado", color: "var(--text-faint)" };

                    return (
                      <article key={item.key} className="insightCard">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                          <div>
                            <h3 style={{ marginBottom: "6px" }}>{item.name}</h3>
                            <p style={{ margin: 0 }}>
                              {isPurchased
                                ? "Informe disponible."
                                : isBlocked
                                ? "Requiere La Herida y el Don."
                                : `Desbloquea este informe por ${item.price}.`}
                            </p>
                          </div>
                          {badge && (
                            <span style={{
                              flexShrink: 0,
                              padding: "4px 10px",
                              border: "1px solid var(--line)",
                              borderRadius: "999px",
                              fontSize: "12px",
                              color: badge.color,
                              letterSpacing: "0.06em",
                              textTransform: "uppercase",
                            }}>
                              {badge.label}
                            </span>
                          )}
                        </div>

                        {isPurchased && (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "14px" }}>
                            {p?.pdfUrl && (
                              <a href={p.pdfUrl} target="_blank" rel="noreferrer" download
                                style={{ textDecoration: "underline", fontSize: "14px" }}>
                                Descargar PDF
                              </a>
                            )}
                            {isMapaInterior && p?.avatarUrl && (
                              <a href={p.avatarUrl} target="_blank" rel="noreferrer" download
                                style={{ textDecoration: "underline", fontSize: "14px" }}>
                                Descargar Avatar
                              </a>
                            )}
                            {isMapaInterior && p?.chartUrl && (
                              <a href={p.chartUrl} target="_blank" rel="noreferrer" download
                                style={{ textDecoration: "underline", fontSize: "14px" }}>
                                Descargar Carta Astral
                              </a>
                            )}
                          </div>
                        )}

                        {isAvailable && (
                          <div style={{ marginTop: "14px" }}>
                            <button
                              type="button"
                              className="primaryButton"
                              disabled={checkoutLoading === item.key}
                              onClick={() => {
                                setPendingPortalCheckout({ productType: item.key, chartId: portalData.chartId, reportId: portalData.reportId });
                                if (item.key === "COMPATIBILITY") setVinculoStep(true);
                              }}
                            >
                              {checkoutLoading === item.key ? "Redirigiendo..." : `${item.name} · ${item.price}`}
                            </button>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </>
              );
            })()}
          </div>
        </section>
      </main>

      <SiteFooter lang={lang} />

      {pendingPortalCheckout?.productType === "COMPATIBILITY" && vinculoStep && (
        <VinculoConfigModal
          lang={lang}
          onConfirm={(vd) => { setVinculoData(vd); setVinculoStep(false); }}
          onCancel={() => { setPendingPortalCheckout(null); setVinculoStep(false); setVinculoData(null); }}
        />
      )}

      {pendingPortalCheckout && !vinculoStep && (
        <ConsentModal
          lang={lang}
          onConfirm={(data) => {
            const args = pendingPortalCheckout;
            setPendingPortalCheckout(null);
            setVinculoData(null);
            handlePortalCheckout(args.productType, args.chartId, args.reportId, data);
          }}
          onCancel={() => { setPendingPortalCheckout(null); setVinculoData(null); }}
        />
      )}
    </div>
  );
}
