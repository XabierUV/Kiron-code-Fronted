"use client";

import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { HeroSection } from "@/components/hero-section";
import { ChartForm } from "@/components/chart-form";
import { PreviewSection } from "@/components/preview-section";
import { SiteFooter } from "@/components/site-footer";
import { ConsentModal, type ConsentData } from "@/components/consent-modal";
import { VinculoConfigModal, type VinculoData } from "@/components/vinculo-config-modal";
import { copy } from "@/lib/copy";
import { createCheckout, fetchChart } from "@/lib/api";
import type {
  ChartData,
  Lang,
  LocationData,
  PreviewData,
  PremiumReport,
} from "@/types/chart";

function FaqSection({ t }: { t: typeof copy["es"] | typeof copy["en"] }) {
  const [open, setOpen] = useState<number | null>(null);
  const faq = t.faq;

  return (
    <section className="contentSection">
      <div className="sectionIntro">
        <p className="sectionLabel">{faq.sectionLabel}</p>
        <h2 className="sectionTitle">{faq.title}</h2>
      </div>

      <div style={{ minWidth: 0 }}>
        {faq.items.map((item: { q: string; a: string }, i: number) => (
          <div
            key={i}
            style={{
              borderBottom: "1px solid var(--line)",
              cursor: "pointer",
            }}
            onClick={() => setOpen(open === i ? null : i)}
          >
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "20px 0",
              gap: "16px",
            }}>
              <span style={{ fontSize: "clamp(16px, 2vw, 20px)", letterSpacing: "-0.02em" }}>
                {item.q}
              </span>
              <span style={{
                flexShrink: 0,
                fontSize: "20px",
                color: "var(--text-faint)",
                transition: "transform 200ms ease",
                transform: open === i ? "rotate(45deg)" : "none",
              }}>+</span>
            </div>
            {open === i && (
              <p style={{
                margin: "0 0 20px",
                color: "var(--text-soft)",
                fontSize: "16px",
                lineHeight: "1.7",
                maxWidth: "68ch",
              }}>
                {item.a}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

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
  const [pendingProductType, setPendingProductType] = useState<"CHIRON" | "NATAL_CHART" | "COMPATIBILITY" | "SUBSCRIPTION" | null>(null);
  const [vinculoStep, setVinculoStep] = useState(false);
  const [vinculoData, setVinculoData] = useState<VinculoData | null>(null);
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

  async function handleCheckout(
    productType: "CHIRON" | "NATAL_CHART" | "COMPATIBILITY" | "SUBSCRIPTION" = "CHIRON",
    consentData?: ConsentData
  ) {
    try {
      console.log("handleCheckout start", { chartId, reportId, productType });

      if (!chartId || !reportId) {
        const msg = lang === "en"
          ? "Generate your birth chart first before purchasing."
          : "Primero genera una carta antes de pasar a Premium.";
        alert(msg);
        setFormMessage(msg);
        scrollToId("chart");
        return;
      }

      setCheckoutLoading(true);

      const vd = vinculoData;
      const checkout = await createCheckout({
        chartId,
        reportId,
        productType,
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
            premiumReport ? scrollToId("full-report") : setPendingProductType("CHIRON")
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
            <p className="sectionLabel">{t.products.sectionLabel}</p>
            <h2 className="sectionTitle">{t.products.title}</h2>
            <p className="sectionText">{t.products.subtitle}</p>
          </div>

          <div className="resultsPanel">
            {/* Tu Quirón — incluido, sin botón de compra */}
            <article className="insightCard">
              <h3>{t.products.items[0].name}</h3>
              <p>{t.products.items[0].description}</p>
              <p className="miniLabel" style={{ marginTop: "12px" }}>{t.products.items[0].price}</p>
            </article>

            {/* Productos de pago */}
            {(
              [
                {
                  item: t.products.items[1],
                  productType: "CHIRON" as const,
                  btnLabel: lang === "en" ? "Get started · €19" : "Comenzar · 19€",
                  note: null,
                },
                {
                  item: t.products.items[2],
                  productType: "NATAL_CHART" as const,
                  btnLabel: lang === "en" ? "Unlock · €39" : "Desbloquear · 39€",
                  note: lang === "en" ? "Requires The Wound and the Gift" : "Requiere La Herida y el Don",
                },
                {
                  item: t.products.items[3],
                  productType: "COMPATIBILITY" as const,
                  btnLabel: lang === "en" ? "Unlock · €59" : "Desbloquear · 59€",
                  note: lang === "en" ? "Requires Your Inner Map" : "Requiere Tu Mapa Interior",
                },
                {
                  item: t.products.items[4],
                  productType: "SUBSCRIPTION" as const,
                  btnLabel: lang === "en" ? "Subscribe · €9/mo" : "Suscribirse · 9€/mes",
                  note: null,
                },
              ] as const
            ).map((product) => (
              <article key={product.productType} className="insightCard">
                <h3>{product.item.name}</h3>
                <p>{product.item.description}</p>
                <p className="miniLabel" style={{ marginTop: "12px", marginBottom: "16px" }}>{product.item.price}</p>
                <button
                  type="button"
                  className="primaryButton"
                  disabled={checkoutLoading}
                  onClick={() => {
                    setPendingProductType(product.productType);
                    if (product.productType === "COMPATIBILITY") setVinculoStep(true);
                  }}
                  style={{ width: "100%" }}
                >
                  {checkoutLoading ? (lang === "en" ? "Redirecting..." : "Redirigiendo...") : product.btnLabel}
                </button>
                {product.note && (
                  <p style={{ margin: "8px 0 0", fontSize: "12px", color: "var(--text-faint)", textAlign: "center" }}>
                    {product.note}
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>

        <FaqSection t={t} />
      </main>

      <SiteFooter lang={lang} />

      {pendingProductType === "COMPATIBILITY" && vinculoStep && (
        <VinculoConfigModal
          lang={lang}
          onConfirm={(vd) => {
            setVinculoData(vd);
            setVinculoStep(false);
          }}
          onCancel={() => { setPendingProductType(null); setVinculoStep(false); setVinculoData(null); }}
        />
      )}

      {pendingProductType && !vinculoStep && (
        <ConsentModal
          lang={lang}
          onConfirm={(data) => {
            const pt = pendingProductType;
            setPendingProductType(null);
            setVinculoData(null);
            handleCheckout(pt, data);
          }}
          onCancel={() => { setPendingProductType(null); setVinculoData(null); }}
        />
      )}
    </div>
  );
}