"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  fetchUnlockedReportBySession,
  verifyCheckoutSession,
} from "@/lib/api";
import type { Lang, PremiumReport } from "@/types/chart";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const COUNTDOWN_SECONDS = 10 * 60;

type UnlockedReportState = {
  report: {
    id: string;
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    async function loadReport() {
      try {
        const params = new URLSearchParams(window.location.search);
        const sessionId = params.get("session_id");

        if (!sessionId) {
          setError("No se encontró session_id en la URL.");
          return;
        }

        await verifyCheckoutSession(sessionId);
        const result = await fetchUnlockedReportBySession(sessionId);
        setData(result);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "No se pudo recuperar el informe desbloqueado."
        );
      } finally {
        setLoading(false);
      }
    }

    loadReport();
  }, []);

  // Countdown — only ticks while PDF is not yet available
  useEffect(() => {
    if (data?.report?.pdfUrl) return;
    if (countdown <= 0) return;
    const id = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(id);
  }, [data?.report?.pdfUrl, countdown]);

  const hasPdf = Boolean(data?.report?.pdfUrl);

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
                      <p style={{ margin: 0 }}>
                        En los próximos minutos recibirás tu informe en el email que proporcionaste durante el pago.
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

                <div style={{ marginTop: "8px" }}>
                  <button type="button" className="primaryButton" style={{ width: "100%", minHeight: "64px", fontSize: "17px" }}>
                    Descubrir Tu Mapa Interior · 39€
                  </button>
                </div>
              </div>
            </>
          )}

        </section>
      </main>

      <SiteFooter lang={lang} />
    </div>
  );
}
