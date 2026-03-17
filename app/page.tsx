"use client";

import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { HeroSection } from "@/components/hero-section";
import { ChartForm } from "@/components/chart-form";
import { PreviewSection } from "@/components/preview-section";
import { SiteFooter } from "@/components/site-footer";
import { copy } from "@/lib/copy";
import { createCheckout, fetchChart } from "@/lib/api";
import type {
  ChartData,
  Lang,
  LocationData,
  PreviewData,
  PremiumReport,
} from "@/types/chart";

function scrollToId(id: string) {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export default function Page() {
  const [lang, setLang] = useState<Lang>("es");
  const [scrolled, setScrolled] = useState(false);

  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthCity, setBirthCity] = useState("");
  const [birthCountry, setBirthCountry] = useState("");

  const [loading, setLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [formMessage, setFormMessage] = useState("");

  const [resolvedLocation, setResolvedLocation] = useState<LocationData | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [premiumReport, setPremiumReport] = useState<PremiumReport | null>(null);
  const [chartId, setChartId] = useState<string | null>(null);
  const [reportId, setReportId] = useState<string | null>(null);

  const t = useMemo(() => copy[lang], [lang]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setFormMessage("");
    setResolvedLocation(null);
    setChartData(null);
    setPreviewData(null);
    setPremiumReport(null);
    setChartId(null);
    setReportId(null);

    if (!name || !birthDate || !birthTime || !birthCity || !birthCountry) {
      setFormMessage(t.form.validation);
      return;
    }

    try {
      setLoading(true);

      const data = await fetchChart({
        name,
        birthDate,
        birthTime,
        birthCity,
        birthCountry,
      });

      setResolvedLocation(data.location ?? null);
      setChartData(data.chart ?? null);
      setPreviewData(data.preview ?? null);
      setChartId(data.chartId ?? null);
      setReportId(data.reportId ?? null);
      setFormMessage(t.form.success);

      scrollToId("results");
    } catch (error) {
      setFormMessage(
        error instanceof Error ? error.message : t.form.genericError
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckout() {
    try {
      console.log("handleCheckout start", { chartId, reportId });

      if (!chartId || !reportId) {
        const msg = "Primero genera una carta antes de pasar a Premium.";
        console.error(msg);
        alert(msg);
        setFormMessage(msg);
        return;
      }

      setCheckoutLoading(true);

      const checkout = await createCheckout({
        chartId,
        reportId,
        productType: "CHIRON",
      });

      console.log("checkout response", checkout);

      if (checkout.checkoutUrl) {
        console.log("redirecting to", checkout.checkoutUrl);
        window.location.href = checkout.checkoutUrl;
        return;
      }

      throw new Error("No se recibió checkoutUrl desde el backend.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error iniciando el checkout.";

      console.error("handleCheckout error", error);
      alert(message);
      setFormMessage(message);
    } finally {
      setCheckoutLoading(false);
    }
  }

  return (
    <div className="pageShell" id="top">
      <SiteHeader
        lang={lang}
        setLang={setLang}
        scrolled={scrolled}
        onNavigate={scrollToId}
      />

      <main className="pageContent">
        <HeroSection lang={lang} />

        <ChartForm
          lang={lang}
          name={name}
          birthDate={birthDate}
          birthTime={birthTime}
          birthCity={birthCity}
          birthCountry={birthCountry}
          loading={loading}
          formMessage={formMessage}
          setName={setName}
          setBirthDate={setBirthDate}
          setBirthTime={setBirthTime}
          setBirthCity={setBirthCity}
          setBirthCountry={setBirthCountry}
          onSubmit={handleSubmit}
        />

        <PreviewSection
          lang={lang}
          chartData={chartData}
          previewData={previewData}
          resolvedLocation={resolvedLocation}
          hasPremiumReport={Boolean(premiumReport)}
          onPremiumClick={() =>
            premiumReport ? scrollToId("full-report") : handleCheckout()
          }
        />

        {premiumReport ? (
          <section className="contentSection" id="full-report">
            <div className="sectionIntro">
              <p className="sectionLabel">Premium Report</p>
              <h2 className="sectionTitle">Tu informe completo.</h2>
              <p className="sectionText">
                Este es el contenido automático guardado en base de datos y recuperado por reportId.
              </p>
            </div>

            <div className="resultsPanel">
              {premiumReport.sections.map((section, index) => (
                <article key={index} className="insightCard">
                  <h3>{section.title}</h3>
                  <p>{section.text}</p>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <section className="contentSection" id="productos">
          <div className="sectionIntro">
            <p className="sectionLabel">Productos</p>
            <h2 className="sectionTitle">Elige tu camino.</h2>
            <p className="sectionText">Cada producto revela una capa más profunda de tu mapa.</p>
          </div>

          <div className="resultsPanel">
            {[
              {
                name: "Tu Quirón",
                description: "Calculamos tu Quirón con precisión astronómica real. Signo, casa, grado. Tu rueda natal completa. El punto de partida de todo.",
                price: "Incluido",
              },
              {
                name: "La Herida y el Don · 19€",
                description: "12 páginas que nombran lo que llevas años sintiendo sin poder explicarlo. Tu herida, cómo se formó, cómo se repite y el don que emerge cuando la sanas.",
                price: "19€ · Pago único",
              },
              {
                name: "Tu Mapa Interior · 39€",
                description: "Tu carta natal completa. Sol, Luna, Saturno, Nodo Norte y todos los aspectos que definen quién eres y hacia dónde vas. Incluye La Herida y el Don.",
                price: "39€ · Pago único",
              },
              {
                name: "El Vínculo · 59€",
                description: "Dos cartas comparadas. Por qué te enganchas a ciertas personas, qué activan en tu herida y qué pueden construir juntos.",
                price: "59€ · Pago único",
              },
              {
                name: "Kiron Vivo · 9€/mes",
                description: "Tránsitos mensuales de Quirón. Qué se activa en ti cada mes, cuándo son tus momentos de mayor crecimiento y cómo navegarlos.",
                price: "9€/mes · Cancela cuando quieras",
              },
            ].map((product) => (
              <article key={product.name} className="insightCard">
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <p className="miniLabel" style={{ marginTop: "12px", marginBottom: 0 }}>{product.price}</p>
              </article>
            ))}
          </div>
        </section>

      </main>

      <SiteFooter lang={lang} />
    </div>
  );
}