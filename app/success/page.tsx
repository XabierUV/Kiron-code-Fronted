"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  fetchUnlockedReportBySession,
  verifyCheckoutSession,
} from "@/lib/api";
import type { PremiumReport } from "@/types/chart";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<UnlockedReportState | null>(null);

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
    <main className="pageContent">
      <section className="contentSection">
        <div className="sectionIntro">
          <p className="sectionLabel">Pago completado</p>
          <h1 className="sectionTitle">Tu compra se ha procesado correctamente.</h1>
          <p className="sectionText">
            Aquí tienes tu informe premium desbloqueado.
          </p>
          <Link href="/" className="primaryButton">
            Volver al inicio
          </Link>
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
              <h3>Descargar PDF</h3>
              <p>Tu informe premium ya está disponible también en formato PDF.</p>
              <p>
                <a
                  href={data.report.pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  download="kiron-report.pdf"
                >
                  Abrir PDF premium
                </a>
              </p>
            </article>
          ) : null}

          {data?.report?.reportJson ? (
            <>
              {data.report.reportJson.sections.map((section, index) => (
                <article key={index} className="insightCard">
                  <h3>{section.title}</h3>
                  <p>{section.text}</p>
                </article>
              ))}
              <button type="button" className="primaryButton">
                Descubrir mi informe psicológico completo · 39€
              </button>
            </>
          ) : null}
        </div>
      </section>
    </main>
  );
}