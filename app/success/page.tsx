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

export default function SuccessPage() {
  const [lang, setLang] = useState<Lang>("es");
  const [scrolled, setScrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<UnlockedReportState | null>(null);

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
          <p className="sectionLabel">Pago completado</p>
          <h1 className="sectionTitle">Tu informe está listo.</h1>
          <p className="sectionText">
            Aquí tienes tu informe premium desbloqueado.
          </p>
          <p className="sectionText" style={{ marginTop: "14px" }}>
            En los próximos 10 minutos recibirás tu informe en el email que proporcionaste durante el pago.
          </p>
          <p style={{ marginTop: "24px" }}>
            <Link href="/" style={{ textDecoration: "underline", color: "var(--text-soft)" }}>
              Volver al inicio
            </Link>
          </p>
        </div>

        <div className="resultsPanel">
          {loading ? (
            <article className="insightCard">
              <h3>Cargando informe...</h3>
              <p>Estamos validando el pago y recuperando tu contenido premium.</p>
            </article>
          ) : null}

          {error ? (
            <article className="insightCard">
              <h3>No se pudo cargar el informe</h3>
              <p>{error}</p>
            </article>
          ) : null}

          {data?.report?.pdfUrl ? (
            <article className="insightCard">
              <h3>Tu informe en PDF</h3>
              <p>Descárgalo ahora y tenlo siempre disponible.</p>
              <a
                href={data.report.pdfUrl}
                target="_blank"
                rel="noreferrer"
                download="kiron-report.pdf"
                style={{ textDecoration: "underline", marginTop: "12px", display: "inline-block" }}
              >
                Abrir PDF
              </a>
            </article>
          ) : null}

          {data?.report?.reportJson ? (
            <>
              {data.report.reportJson.sections.map((section, index) => (
                <article key={index} className="insightCard" style={{ paddingTop: "28px", paddingBottom: "28px" }}>
                  <h3 style={{ fontSize: "20px", marginBottom: "12px" }}>{section.title}</h3>
                  <p style={{ lineHeight: "1.8" }}>{section.text}</p>
                </article>
              ))}
              <div style={{ marginTop: "40px" }}>
                <button type="button" className="primaryButton">
                  Descubrir Tu Mapa Interior · 39€
                </button>
              </div>
            </>
          ) : null}
        </div>
      </section>
      </main>

      <SiteFooter lang={lang} />
    </div>
  );
}
