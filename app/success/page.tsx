"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  fetchUnlockedReportBySession,
  verifyCheckoutSession,
  createCheckout,
} from "@/lib/api";
import { ConsentModal, type ConsentData } from "@/components/consent-modal";
import type { Lang, PremiumReport } from "@/types/chart";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const COUNTDOWN_SECONDS = 10 * 60;

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
  };
};

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function SuccessPage() {
  const [lang, setLang] = useState<Lang>("es");
  const [scrolled, setScrolled] = useState(false);
  const [, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<UnlockedReportState | null>(null);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [upsellLoading, setUpsellLoading] = useState(false);
  const [showUpsellModal, setShowUpsellModal] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
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
        // "not delivered yet" is normal during generation — keep polling silently
        if (active && !msg.includes("not delivered")) {
          // unexpected error — still keep polling, timeout will handle it
        }
      }
    }

    async function init() {
      try {
        await verifyCheckoutSession(sessionId!);
      } catch {
        // non-fatal — continue to polling
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

  // Countdown — ticks while PDF not yet available
  useEffect(() => {
    if (data?.report?.pdfUrl) return;
    if (countdown <= 0) return;
    const id = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(id);
  }, [data?.report?.pdfUrl, countdown]);

  // Show error only after timeout (10 min elapsed, still no PDF)
  useEffect(() => {
    if (countdown === 0 && !data?.report?.pdfUrl) {
      setError(
        "El informe está tardando más de lo esperado. Revisa tu email o accede desde MI CARTA."
      );
    }
  }, [countdown, data?.report?.pdfUrl]);

  const hasPdf = Boolean(data?.report?.pdfUrl);

  const UPSELL_MAP: Record<string, { productType: "NATAL_CHART" | "COMPATIBILITY"; label: string; labelEn: string }> = {
    CHIRON:      { productType: "NATAL_CHART",   label: "Descubrir Tu Mapa Interior · 39€", labelEn: "Discover Your Inner Map · €39" },
    NATAL_CHART: { productType: "COMPATIBILITY", label: "Descubrir El Vínculo · 59€",       labelEn: "Discover The Bond · €59" },
  };
  const upsell = data?.order?.productType ? UPSELL_MAP[data.order.productType] ?? null : null;

  async function handleUpsell(consentData?: ConsentData) {
    if (!upsell || !data) return;
    setUpsellLoading(true);
    try {
      const checkout = await createCheckout({
        chartId: data.report.chartId,
        reportId: data.report.id,
        productType: upsell.productType,
        deliveryEmail: consentData?.deliveryEmail,
        marketingConsent: consentData?.marketingConsent,
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

          {/* ── ESTADO 1: informe en generación ── */}
          {!hasPdf && (
            <>
              <div className="sectionIntro">
                <p className="sectionLabel">Pago completado</p>
                <h1 className="sectionTitle">Tu informe está siendo generado.</h1>
              </div>

              <div className="resultsPanel">
                {error ? (
                  <article className="insightCard">
                    <h3>No se pudo cargar el informe</h3>
                    <p>{error}</p>
                  </article>
                ) : (
                  <>
                    <div style={{ textAlign: "center", padding: "32px 0 24px" }}>
                      <p style={{
                        margin: 0,
                        fontSize: "clamp(64px, 14vw, 96px)",
                        fontWeight: "700",
                        letterSpacing: "-0.05em",
                        lineHeight: 1,
                        color: "var(--text)",
                      }}>
                        {formatTime(countdown)}
                      </p>
                    </div>

                    <article className="insightCard">
                      <p style={{ margin: 0, fontWeight: 700, lineHeight: 1.7 }}>
                        {lang === "en" ? (
                          <>Your report will arrive in the email you used during checkout within the next few minutes. If you leave this page, you can access it anytime from{" "}
                            <Link href="/mi-carta" style={{ color: "var(--text)", textDecoration: "underline" }}>MY CHART</Link>.</>
                        ) : (
                          <>En los próximos minutos recibirás tu informe en el email que usaste durante el pago. Si sales de esta página, puedes acceder a él en cualquier momento desde{" "}
                            <Link href="/mi-carta" style={{ color: "var(--text)", textDecoration: "underline" }}>MI CARTA</Link>.</>
                        )}
                      </p>
                    </article>

                    <p style={{ marginTop: "8px" }}>
                      <Link href="/" className="secondaryButton" style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }}>
                        Volver al inicio
                      </Link>
                    </p>
                  </>
                )}
              </div>
            </>
          )}

          {/* ── ESTADO 2: PDF disponible ── */}
          {hasPdf && (
            <>
              <div className="sectionIntro">
                <p className="sectionLabel">Pago completado</p>
                <h1 className="sectionTitle">Tu informe está listo.</h1>
                <p className="sectionText">
                  Aquí tienes tu informe premium desbloqueado.
                </p>
              </div>

              <div className="resultsPanel">
                <article className="insightCard">
                  <h3>Tu informe en PDF</h3>
                  <p>Descárgalo ahora y tenlo siempre disponible.</p>
                  <a
                    href={data!.report.pdfUrl!}
                    target="_blank"
                    rel="noreferrer"
                    download="kiron-report.pdf"
                    style={{ textDecoration: "underline", marginTop: "12px", display: "inline-block" }}
                  >
                    Abrir PDF
                  </a>
                </article>

                {data?.report?.reportJson?.sections.map((section, index) => (
                  <article key={index} className="insightCard" style={{ paddingTop: "28px", paddingBottom: "28px" }}>
                    <h3 style={{ fontSize: "20px", marginBottom: "12px" }}>{section.title}</h3>
                    <p style={{ lineHeight: "1.8" }}>{section.text}</p>
                  </article>
                ))}

                {upsell && (
                  <div style={{ marginTop: "8px" }}>
                    <button
                      type="button"
                      className="primaryButton"
                      style={{ width: "100%", minHeight: "64px", fontSize: "17px" }}
                      disabled={upsellLoading}
                      onClick={() => setShowUpsellModal(true)}
                    >
                      {upsellLoading
                        ? (lang === "en" ? "Redirecting..." : "Redirigiendo...")
                        : (lang === "en" ? upsell.labelEn : upsell.label)}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

        </section>
      </main>

      <SiteFooter lang={lang} />

      {showUpsellModal && (
        <ConsentModal
          lang={lang}
          onConfirm={(data) => {
            setShowUpsellModal(false);
            handleUpsell(data);
          }}
          onCancel={() => setShowUpsellModal(false)}
        />
      )}
    </div>
  );
}
