"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  fetchUnlockedReportBySession,
  verifyCheckoutSession,
  createCheckout,
} from "@/lib/api";
import { ConsentModal, type ConsentData } from "@/components/consent-modal";
import { VinculoConfigModal, type VinculoData } from "@/components/vinculo-config-modal";
import type { Lang, PremiumReport } from "@/types/chart";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

type UnlockedReportState = {
  report: {
    id: string;
    chartId: string;
    status: string;
    reportJson: PremiumReport | null;
    pdfUrl: string | null;
  };
  order: {
    id: string;
    productType: string;
    paymentStatus: string;
    customerEmail?: string | null;
  };
};

function firstDayNextMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() + 1, 1).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

type ProductCfg = {
  countdownSec: number | null;
  waitingTitle: string;
  waitingTitleEn: string;
  productTitle: string;
  productTitleEn: string;
  upsellProductType: string | null;
  upsellTitle: string | null;
  upsellTitleEn: string | null;
  upsellDesc: string | null;
  upsellDescEn: string | null;
};

const PRODUCT_CONFIG: Record<string, ProductCfg> = {
  CHIRON: {
    countdownSec: 10 * 60,
    waitingTitle: "Tu informe está listo.", waitingTitleEn: "Your report is ready.",
    productTitle: "La Herida y el Don",     productTitleEn: "The Wound and the Gift",
    upsellProductType: "NATAL_CHART",
    upsellTitle:    "Tu Mapa Interior · 39€",
    upsellTitleEn:  "Your Inner Map · €39",
    upsellDesc:   "Tu carta natal completa. Sol, Luna, Saturno, Nodo Norte y todos los aspectos que definen quién eres y hacia dónde vas.",
    upsellDescEn: "Your complete birth chart. Sun, Moon, Saturn, North Node and all the aspects that define who you are and where you're going.",
  },
  NATAL_CHART: {
    countdownSec: 15 * 60,
    waitingTitle: "Tu Mapa Interior está en camino.", waitingTitleEn: "Your Inner Map is on its way.",
    productTitle: "Tu Mapa Interior",                productTitleEn: "Your Inner Map",
    upsellProductType: "COMPATIBILITY",
    upsellTitle:    "El Vínculo · 59€",
    upsellTitleEn:  "The Bond · €59",
    upsellDesc:   "Dos cartas comparadas. Descubre por qué te enganchas a ciertas personas, qué activan en tu herida y qué podéis construir juntos.",
    upsellDescEn: "Two charts compared. Discover why you get attached to certain people, what they activate in your wound and what you can build together.",
  },
  COMPATIBILITY: {
    countdownSec: 20 * 60,
    waitingTitle: "El Vínculo está en camino.", waitingTitleEn: "The Bond is on its way.",
    productTitle: "El Vínculo",                productTitleEn: "The Bond",
    upsellProductType: "SUBSCRIPTION",
    upsellTitle:    "Kiron Vivo · 9€/mes",
    upsellTitleEn:  "Kiron Vivo · €9/mo",
    upsellDesc:   "Cada mes, un análisis personalizado de los tránsitos que afectan a tu carta. Contenido premium adaptado a ti.",
    upsellDescEn: "Each month, a personalized analysis of the transits affecting your chart. Premium content adapted to you.",
  },
  SUBSCRIPTION: {
    countdownSec: null,
    waitingTitle: "Bienvenido a Kiron Vivo.", waitingTitleEn: "Welcome to Kiron Vivo.",
    productTitle: "Kiron Vivo",              productTitleEn: "Kiron Vivo",
    upsellProductType: null,
    upsellTitle: null, upsellTitleEn: null, upsellDesc: null, upsellDescEn: null,
  },
};

function getUrlProductType(): string | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("product_type");
}

export default function SuccessPage() {
  const [lang, setLang] = useState<Lang>("es");
  const [scrolled, setScrolled] = useState(false);
  const [, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<UnlockedReportState | null>(null);
  const [urlProductType] = useState<string | null>(getUrlProductType);
  const [purchasedProducts, setPurchasedProducts] = useState<Set<string>>(new Set());
  const [upsellLoading, setUpsellLoading] = useState(false);
  const [showUpsellModal, setShowUpsellModal] = useState(false);
  const [upsellVinculoStep, setUpsellVinculoStep] = useState(false);
  const [upsellVinculoData, setUpsellVinculoData] = useState<VinculoData | null>(null);

  const productType = data?.order?.productType ?? urlProductType ?? "CHIRON";
  const cfg = PRODUCT_CONFIG[productType] ?? PRODUCT_CONFIG.CHIRON;
  const showUpsell = Boolean(cfg.upsellTitle) &&
    !(cfg.upsellProductType === "SUBSCRIPTION" && purchasedProducts.has("SUBSCRIPTION"));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("kc_purchased");
      if (raw) setPurchasedProducts(new Set(JSON.parse(raw)));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (!sessionId) {
      setError("No se encontró session_id en la URL.");
      setLoading(false);
      return;
    }

    let active = true;

    async function tryFetch() {
      try {
        const result = await fetchUnlockedReportBySession(sessionId!);
        if (active) setData(result);
      } catch (err) {
        const msg = err instanceof Error ? err.message.toLowerCase() : "";
        if (active && !msg.includes("not delivered")) {
          // unexpected error — keep polling, timeout will handle it
        }
      }
    }

    async function init() {
      try {
        await verifyCheckoutSession(sessionId!);
      } catch {
        // non-fatal
      }
      if (active) setLoading(false);
      tryFetch();
    }

    init();
    const pollId = setInterval(tryFetch, 10_000);

    return () => {
      active = false;
      clearInterval(pollId);
    };
  }, []);

  const hasPdf = Boolean(data?.report?.pdfUrl);

  async function handleUpsell(consentData?: ConsentData) {
    if (!cfg.upsellProductType || !data) return;
    setUpsellLoading(true);
    const vd = upsellVinculoData;
    try {
      const checkout = await createCheckout({
        chartId: data.report.chartId,
        reportId: data.report.id,
        productType: cfg.upsellProductType as "NATAL_CHART" | "COMPATIBILITY" | "SUBSCRIPTION",
        deliveryEmail: consentData?.deliveryEmail,
        marketingConsent: consentData?.marketingConsent,
        ...(vd && {
          vinculoRelationship: vd.relationship,
          vinculoPersonBId: vd.personBId,
          vinculoPerson2Name: vd.person2Name,
          vinculoPerson2Date: vd.person2BirthDate,
          vinculoPerson2Time: vd.person2BirthTime,
          vinculoPerson2City: vd.person2BirthCity,
        }),
      });
      if (checkout.checkoutUrl) window.location.href = checkout.checkoutUrl;
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error iniciando el pago.");
    } finally {
      setUpsellLoading(false);
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

          {/* ── ESTADO 1: generando ── */}
          {!hasPdf && (
            <>
              <div className="sectionIntro">
                <p className="sectionLabel">Pago completado</p>
                <h1 className="sectionTitle">
                  {lang === "en" ? cfg.productTitleEn : cfg.productTitle}
                </h1>
              </div>

              <div className="resultsPanel">
                {error ? (
                  <article className="insightCard">
                    <h3>No se pudo cargar el informe</h3>
                    <p>{error}</p>
                  </article>
                ) : productType === "SUBSCRIPTION" ? (
                  <article className="insightCard">
                    <p style={{ margin: "0 0 12px", fontWeight: 700, lineHeight: 1.7 }}>
                      {lang === "en" ? "Welcome to your personal space." : "Bienvenido a tu espacio personal."}
                    </p>
                    <p style={{ margin: "0 0 12px", lineHeight: 1.7 }}>
                      {lang === "en"
                        ? `Your first delivery will arrive on ${firstDayNextMonth()}.`
                        : `Tu primera entrega llegará el ${firstDayNextMonth()}.`}
                    </p>
                    <p style={{ margin: "0 0 12px", lineHeight: 1.7 }}>
                      {lang === "en" ? (
                        <>You can find your products in{" "}
                          <Link href="/mi-galaxia" style={{ color: "var(--text)", textDecoration: "underline" }}>MI GALAXIA</Link>, your personal space.</>
                      ) : (
                        <>Puedes encontrar tus productos en{" "}
                          <Link href="/mi-galaxia" style={{ color: "var(--text)", textDecoration: "underline" }}>MI GALAXIA</Link>, tu espacio personal.</>
                      )}
                    </p>
                    <p style={{ margin: 0, lineHeight: 1.7 }}>
                      {lang === "en" ? "Thank you for your purchase." : "Muchas gracias por tu compra."}
                    </p>
                  </article>
                ) : (
                  <article className="insightCard">
                    <p style={{ margin: "0 0 20px", fontWeight: 700, fontSize: "1.15rem", lineHeight: 1.5 }}>
                      {lang === "en"
                        ? "Your report is being prepared."
                        : "Tu informe está siendo preparado."}
                    </p>
                    <p style={{ margin: "0 0 16px", lineHeight: 1.8, color: "var(--text-faint)" }}>
                      {lang === "en"
                        ? "Our team is working on your personalised analysis. Kiron Code reports are crafted with real astronomical precision and psychological content adapted to your unique birth chart."
                        : "Nuestro equipo está trabajando en tu análisis personalizado. Los informes de Kiron Code se elaboran con precisión astronómica real y contenido psicológico adaptado a tu carta natal única."}
                    </p>
                    <p style={{ margin: 0, lineHeight: 1.8, color: "var(--text-faint)" }}>
                      {lang === "en"
                        ? "You will receive your complete report with audio included within 24 to 72 hours."
                        : "Recibirás tu informe completo con audio incluido en un plazo de 24 a 72 horas."}
                    </p>
                  </article>
                )}

                {/* Botón Crea tu acceso a MI GALAXIA */}
                {data?.order?.customerEmail && (
                  <article className="insightCard" style={{ textAlign: "center" }}>
                    <p style={{ margin: "0 0 14px", color: "var(--text-faint)", fontSize: "14px" }}>
                      {lang === "en" ? "Save your access for later" : "Guarda tu acceso para más adelante"}
                    </p>
                    <Link
                      href={`/mi-galaxia?email=${encodeURIComponent(data.order.customerEmail)}`}
                      className="secondaryButton"
                      style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }}
                    >
                      {lang === "en" ? "Create your MY GALAXY access" : "Crea tu acceso a MI GALAXIA"}
                    </Link>
                  </article>
                )}
              </div>
            </>
          )}

          {/* ── ESTADO 2: PDF disponible ── */}
          {hasPdf && (
            <>
              <div className="sectionIntro">
                <p className="sectionLabel">Pago completado</p>
                <h1 className="sectionTitle">
                  {lang === "en" ? cfg.waitingTitleEn : cfg.waitingTitle}
                </h1>
              </div>

              <div className="resultsPanel">
                <article className="insightCard">
                  <h3>{lang === "en" ? `${cfg.productTitleEn} — PDF` : `${cfg.productTitle} — PDF`}</h3>
                  <p style={{ margin: "8px 0 16px" }}>
                    {lang === "en"
                      ? "Your personalised report is ready. Download it and keep it forever."
                      : "Tu informe personalizado está listo. Descárgalo y tenlo siempre disponible."}
                  </p>
                  <a
                    href={data!.report.pdfUrl!}
                    target="_blank"
                    rel="noreferrer"
                    download="kiron-report.pdf"
                    style={{ textDecoration: "underline", display: "inline-block" }}
                  >
                    Abrir PDF
                  </a>
                </article>

                {showUpsell && (
                  <article className="insightCard">
                    <p className="miniLabel" style={{ marginBottom: "10px" }}>
                      {lang === "en" ? "NEXT LEVEL" : "SIGUIENTE NIVEL"}
                    </p>
                    <h3 style={{ marginBottom: "10px" }}>
                      {lang === "en" ? cfg.upsellTitleEn : cfg.upsellTitle}
                    </h3>
                    <p style={{ marginBottom: "20px", lineHeight: 1.7 }}>
                      {lang === "en" ? cfg.upsellDescEn : cfg.upsellDesc}
                    </p>
                    <button
                      type="button"
                      className="primaryButton"
                      style={{ width: "100%", minHeight: "56px", fontSize: "16px" }}
                      disabled={upsellLoading}
                      onClick={() => {
                        if (cfg.upsellProductType === "COMPATIBILITY") {
                          setUpsellVinculoStep(true);
                        } else {
                          setShowUpsellModal(true);
                        }
                      }}
                    >
                      {upsellLoading
                        ? (lang === "en" ? "Redirecting..." : "Redirigiendo...")
                        : (lang === "en"
                            ? `Discover ${cfg.upsellTitleEn}`
                            : `Descubrir ${cfg.upsellTitle}`)}
                    </button>
                  </article>
                )}
              </div>
            </>
          )}

        </section>
      </main>

      <SiteFooter lang={lang} />

      {upsellVinculoStep && (
        <VinculoConfigModal
          lang={lang}
          onConfirm={(vd) => { setUpsellVinculoData(vd); setUpsellVinculoStep(false); setShowUpsellModal(true); }}
          onCancel={() => { setUpsellVinculoStep(false); setUpsellVinculoData(null); }}
        />
      )}

      {showUpsellModal && (
        <ConsentModal
          lang={lang}
          onConfirm={(data) => {
            setShowUpsellModal(false);
            handleUpsell(data);
          }}
          onCancel={() => { setShowUpsellModal(false); setUpsellVinculoData(null); }}
        />
      )}
    </div>
  );
}
