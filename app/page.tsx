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
import { createCheckout, fetchChart, fetchPortal } from "@/lib/api";
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

  const [purchasedProducts, setPurchasedProducts] = useState<Set<string>>(new Set());
  const [loggedInName, setLoggedInName] = useState<string | null>(null);
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

  useEffect(() => {
    const token = localStorage.getItem("kc_token");
    if (token) {
      fetchPortal(token)
        .then((portal) => {
          const types = portal.products.map((p) => p.productType);
          setPurchasedProducts(new Set(types));
          localStorage.setItem("kc_purchased", JSON.stringify(types));
          setLoggedInName(portal.name || portal.email);
        })
        .catch(() => {
          // Token expired or invalid — fall back to cached list
          try {
            const raw = localStorage.getItem("kc_purchased");
            if (raw) setPurchasedProducts(new Set(JSON.parse(raw)));
          } catch { /* ignore */ }
        });
    } else {
      try {
        const raw = localStorage.getItem("kc_purchased");
        if (raw) setPurchasedProducts(new Set(JSON.parse(raw)));
      } catch { /* ignore */ }
    }
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
    consentData?: ConsentData,
    vd?: VinculoData | null
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

      const checkout = await createCheckout({
        chartId,
        reportId,
        productType,
        deliveryEmail: consentData?.deliveryEmail,
        marketingConsent: consentData?.marketingConsent,
        ...(productType === "SUBSCRIPTION" && {
          subscriberTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
        ...(vd && {
          vinculoRelationship: vd.relationship,
          vinculoPersonBId: vd.personBId,
          vinculoPerson2Name: vd.person2Name,
          vinculoPerson2Date: vd.person2BirthDate,
          vinculoPerson2Time: vd.person2BirthTime,
          vinculoPerson2City: vd.person2BirthCity,
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
        loggedInName={loggedInName}
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
                  requiresKey: null,
                  lockedNote: null,
                  btnLabel: lang === "en" ? "The Wound and the Gift · €19" : "La Herida y el Don · 19€",
                },
                {
                  item: t.products.items[2],
                  productType: "NATAL_CHART" as const,
                  requiresKey: "CHIRON",
                  lockedNote: lang === "en" ? "Requires The Wound and the Gift" : "Requiere La Herida y el Don",
                  btnLabel: lang === "en" ? "Tu Mapa Interior · €39" : "Tu Mapa Interior · 39€",
                },
                {
                  item: t.products.items[3],
                  productType: "COMPATIBILITY" as const,
                  requiresKey: "NATAL_CHART",
                  lockedNote: lang === "en" ? "Requires Your Inner Map" : "Requiere Tu Mapa Interior",
                  btnLabel: lang === "en" ? "El Vínculo · €59" : "El Vínculo · 59€",
                },
                {
                  item: t.products.items[4],
                  productType: "SUBSCRIPTION" as const,
                  requiresKey: null,
                  lockedNote: null,
                  btnLabel: lang === "en" ? "Subscribe · €9/mo" : "Suscribirse · 9€/mes",
                },
              ] as const
            ).map((product) => {
              const isPurchased = purchasedProducts.has(product.productType);
              const isLocked = !isPurchased && product.requiresKey !== null && !purchasedProducts.has(product.requiresKey);
              return (
                <article key={product.productType} className="insightCard">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                    <div>
                      <h3 style={{ marginBottom: "6px" }}>{product.item.name}</h3>
                      <p style={{ margin: 0 }}>{product.item.description}</p>
                      <p className="miniLabel" style={{ marginTop: "12px" }}>{product.item.price}</p>
                    </div>
                    {isPurchased && (
                      <span style={{ flexShrink: 0, padding: "4px 10px", border: "1px solid var(--line)", borderRadius: "999px", fontSize: "12px", color: "rgba(100,220,130,0.9)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                        {lang === "en" ? "✓ Acquired" : "✓ Adquirido"}
                      </span>
                    )}
                  </div>
                  {!isPurchased && (
                    <div style={{ marginTop: "16px" }}>
                      <button
                        type="button"
                        className="primaryButton"
                        disabled={checkoutLoading || isLocked}
                        onClick={() => {
                          if (isLocked) return;
                          setPendingProductType(product.productType);
                          if (product.productType === "COMPATIBILITY") setVinculoStep(true);
                        }}
                        style={{ width: "100%", opacity: isLocked ? 0.4 : 1, cursor: isLocked ? "not-allowed" : "pointer" }}
                      >
                        {checkoutLoading ? (lang === "en" ? "Redirecting..." : "Redirigiendo...") : product.btnLabel}
                      </button>
                      {isLocked && product.lockedNote && (
                        <p style={{ margin: "8px 0 0", fontSize: "12px", color: "var(--text-faint)", textAlign: "center" }}>
                          {product.lockedNote}
                        </p>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>

          {/* Canal de Telegram */}
          <article className="insightCard" style={{ marginTop: "14px", background: "rgba(201,169,110,0.04)", border: "1px solid rgba(201,169,110,0.18)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
              <span style={{ fontSize: "28px", flexShrink: 0, lineHeight: 1 }}>✈</span>
              <div style={{ flex: 1 }}>
                <h3 style={{ marginBottom: "6px" }}>
                  {lang === "en" ? "Join our community" : "Únete a nuestra comunidad"}
                </h3>
                <p style={{ margin: "0 0 14px", color: "var(--text-soft)", fontSize: "15px", lineHeight: "1.6" }}>
                  {lang === "en"
                    ? "Weekly astrology content, transit analysis and early access to new products. Free, always."
                    : "Contenido astrológico semanal, análisis de tránsitos y acceso anticipado a nuevos productos. Gratis, siempre."}
                </p>
                <a
                  href="https://t.me/Kiron_Code"
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 20px", background: "rgba(201,169,110,0.10)", border: "1px solid rgba(201,169,110,0.35)", borderRadius: "6px", color: "#C9A96E", fontSize: "14px", fontWeight: 600, textDecoration: "none", letterSpacing: "0.03em", transition: "background 200ms" }}
                >
                  {lang === "en" ? "Join the channel →" : "Unirse al canal →"}
                </a>
              </div>
            </div>
          </article>
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
            const vd = vinculoData;
            setPendingProductType(null);
            setVinculoData(null);
            handleCheckout(pt, data, vd);
          }}
          onCancel={() => { setPendingProductType(null); setVinculoData(null); }}
        />
      )}
    </div>
  );
}