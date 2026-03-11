"use client";

import React, { useEffect, useMemo, useState } from "react";

type Lang = "es" | "en";

type LocationData = {
  displayName: string;
  latitude: number;
  longitude: number;
  timezone?: string;
};

type ChironData = {
  sign: string;
  degree: number;
  house: number;
};

type ChartData = {
  chiron: ChironData;
};

type PreviewData = {
  strengths: string;
  challenges: string;
  patterns: string;
};

type ChartResponse = {
  ok: boolean;
  location?: LocationData;
  chart?: ChartData;
  preview?: PreviewData;
  error?: string;
};

const copy = {
  es: {
    nav: {
      chart: "Carta",
      results: "Resultados",
      premium: "Premium",
    },
    hero: {
      eyebrow: "Precisión astronómica. Diseño radical.",
      title: "Descubre tu mapa cósmico.",
      subtitle:
        "Kiron Code interpreta tu nacimiento con una experiencia visual limpia, intensa y pensada para revelar patrones reales.",
      primaryCta: "Generar carta",
      secondaryCta: "Ver premium",
    },
    form: {
      sectionLabel: "Datos de nacimiento",
      title: "Introduce tus datos.",
      subtitle:
        "Fecha, hora, ciudad y país de nacimiento. Con eso generamos tu vista previa.",
      name: "Nombre",
      birthDate: "Fecha de nacimiento",
      birthTime: "Hora de nacimiento",
      birthCity: "Ciudad de nacimiento",
      birthCountry: "País de nacimiento",
      submit: "Ver mi Kiron Code",
      loading: "Generando...",
      helper:
        "Al continuar aceptas nuestras condiciones y política de privacidad.",
      placeholders: {
        name: "Tu nombre",
        city: "Ej. Bilbao",
        country: "Ej. España",
      },
      validation: "Completa todos los campos para continuar.",
      genericError: "Ha ocurrido un error inesperado.",
      success: "Kiron Code generado correctamente.",
    },
    results: {
      sectionLabel: "Vista previa",
      title: "Tu primera lectura.",
      subtitle:
        "Una lectura inicial de Quirón y tres ejes clave para empezar a entender tu patrón.",
      previewTitle: "Adelanto",
      chironTitle: "Tu Quirón",
      sign: "Signo",
      degree: "Grado",
      house: "Casa",
      strengths: "Fortalezas",
      challenges: "Retos",
      patterns: "Patrones",
      fallbackStrengths:
        "Capacidad de decisión cuando alineas intuición y propósito.",
      fallbackChallenges:
        "Elegir el momento: no todo se fuerza, el destino se abre.",
      fallbackPatterns:
        "Ciclos que se repiten en amor, trabajo y cambios importantes.",
      cta: "Desbloquear informe completo",
      location: "Ubicación resuelta",
    },
    premium: {
      sectionLabel: "Premium",
      title: "Desbloquea el informe completo.",
      subtitle:
        "Una interpretación más profunda, clara y diseñada para releerse en los momentos importantes.",
      features: [
        "Análisis completo de carta natal",
        "Lectura estructurada de rasgos y talentos",
        "Ciclos vitales y momentos de cambio",
        "Compatibilidad: vínculos, amor y carrera",
      ],
      button: "Pasar a Premium",
      note: "Pago único. Sin suscripción.",
      price: "19€",
      checkoutTitle: "Premium",
      checkoutText:
        "Aquí conectaremos Stripe más adelante. Por ahora dejamos preparada la estructura visual y funcional.",
      checkoutMeta: "Seguro · Rápido · Acceso inmediato",
      alert: "Solo frontend por ahora.",
    },
    footer: {
      text: "Tu destino, explicado con claridad.",
      rights: `© ${new Date().getFullYear()} Kiron Code. Todos los derechos reservados.`,
    },
  },
  en: {
    nav: {
      chart: "Chart",
      results: "Results",
      premium: "Premium",
    },
    hero: {
      eyebrow: "Astronomical precision. Radical design.",
      title: "Discover your cosmic blueprint.",
      subtitle:
        "Kiron Code interprets your birth through a clean, intense visual experience built to reveal real patterns.",
      primaryCta: "Generate chart",
      secondaryCta: "See premium",
    },
    form: {
      sectionLabel: "Birth data",
      title: "Enter your details.",
      subtitle:
        "Birth date, time, city and country. With that, we generate your preview.",
      name: "Name",
      birthDate: "Birth date",
      birthTime: "Birth time",
      birthCity: "Birth city",
      birthCountry: "Birth country",
      submit: "See my Kiron Code",
      loading: "Generating...",
      helper: "By continuing you agree to our terms and privacy policy.",
      placeholders: {
        name: "Your name",
        city: "e.g. Bilbao",
        country: "e.g. Spain",
      },
      validation: "Please complete all fields to continue.",
      genericError: "An unexpected error occurred.",
      success: "Kiron Code generated successfully.",
    },
    results: {
      sectionLabel: "Preview",
      title: "Your first reading.",
      subtitle:
        "An initial Chiron reading and three key axes to begin understanding your pattern.",
      previewTitle: "Preview",
      chironTitle: "Your Chiron",
      sign: "Sign",
      degree: "Degree",
      house: "House",
      strengths: "Strengths",
      challenges: "Challenges",
      patterns: "Patterns",
      fallbackStrengths:
        "Decisiveness when intuition and purpose align.",
      fallbackChallenges:
        "Timing matters: not everything is forced—destiny opens.",
      fallbackPatterns:
        "Recurring cycles across love, work, and major shifts.",
      cta: "Unlock full report",
      location: "Resolved location",
    },
    premium: {
      sectionLabel: "Premium",
      title: "Unlock the full report.",
      subtitle:
        "A deeper interpretation, clear and designed to be revisited in the moments that matter.",
      features: [
        "Full natal chart analysis",
        "Structured reading of traits and talents",
        "Life cycles and turning points",
        "Compatibility: relationships, love and career",
      ],
      button: "Upgrade to Premium",
      note: "One-time payment. No subscription.",
      price: "€19",
      checkoutTitle: "Premium",
      checkoutText:
        "We’ll connect Stripe later. For now, this prepares the visual and functional structure.",
      checkoutMeta: "Secure · Fast · Instant access",
      alert: "Frontend only for now.",
    },
    footer: {
      text: "Your destiny, clearly explained.",
      rights: `© ${new Date().getFullYear()} Kiron Code. All rights reserved.`,
    },
  },
} satisfies Record<Lang, any>;

function scrollToId(id: string) {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

async function requestChart(payload: {
  name: string;
  birthDate: string;
  birthTime: string;
  birthCity: string;
  birthCountry: string;
}): Promise<ChartResponse> {
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://luminous-patience-production.up.railway.app";

  const response = await fetch(`${apiBaseUrl}/chart`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as ChartResponse;

  if (!response.ok || !data.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

function Header({
  lang,
  setLang,
  scrolled,
  t,
}: {
  lang: Lang;
  setLang: React.Dispatch<React.SetStateAction<Lang>>;
  scrolled: boolean;
  t: (typeof copy)[Lang];
}) {
  return (
    <header className={`siteHeader ${scrolled ? "siteHeaderScrolled" : ""}`}>
      <button
        type="button"
        className="brandButton"
        onClick={() => scrollToId("top")}
        aria-label="Kiron Code"
      >
        <span className="brandMark">K</span>
        <span className="brandText">Kiron Code</span>
      </button>

      <nav className="siteNav" aria-label="Primary">
        <button type="button" className="navAction" onClick={() => scrollToId("chart")}>
          {t.nav.chart}
        </button>
        <button type="button" className="navAction" onClick={() => scrollToId("results")}>
          {t.nav.results}
        </button>
        <button type="button" className="navAction" onClick={() => scrollToId("premium")}>
          {t.nav.premium}
        </button>
      </nav>

      <div className="langSwitch" role="group" aria-label="Language switch">
        <button
          type="button"
          className={`langButton ${lang === "es" ? "active" : ""}`}
          onClick={() => setLang("es")}
        >
          ES
        </button>
        <button
          type="button"
          className={`langButton ${lang === "en" ? "active" : ""}`}
          onClick={() => setLang("en")}
        >
          EN
        </button>
      </div>
    </header>
  );
}

function HeroSection({ t }: { t: (typeof copy)[Lang] }) {
  return (
    <section className="heroSection">
      <p className="eyebrow">{t.hero.eyebrow}</p>
      <h1 className="heroTitle">{t.hero.title}</h1>
      <p className="heroSubtitle">{t.hero.subtitle}</p>

      <div className="heroActions">
        <button type="button" className="primaryButton" onClick={() => scrollToId("chart")}>
          {t.hero.primaryCta}
        </button>
        <button type="button" className="secondaryButton" onClick={() => scrollToId("premium")}>
          {t.hero.secondaryCta}
        </button>
      </div>
    </section>
  );
}

function ChartPreviewOrb() {
  return (
    <div className="chartOrb" aria-hidden="true">
      <div className="orbRing orbRingOne" />
      <div className="orbRing orbRingTwo" />
      <div className="orbRing orbRingThree" />
      <div className="orbGlow" />
      <div className="orbPoint orbPointOne" />
      <div className="orbPoint orbPointTwo" />
      <div className="orbPoint orbPointThree" />
      <div className="orbPoint orbPointFour" />
      <div className="orbPoint orbPointFive" />
      <div className="orbPoint orbPointSix" />
    </div>
  );
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
  const [formMessage, setFormMessage] = useState("");

  const [resolvedLocation, setResolvedLocation] = useState<LocationData | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);

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

    if (!name || !birthDate || !birthTime || !birthCity || !birthCountry) {
      setFormMessage(t.form.validation);
      return;
    }

    try {
      setLoading(true);

      const data = await requestChart({
        name,
        birthDate,
        birthTime,
        birthCity,
        birthCountry,
      });

      setResolvedLocation(data.location ?? null);
      setChartData(data.chart ?? null);
      setPreviewData(data.preview ?? null);
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

  return (
    <div className="pageShell" id="top">
      <Header lang={lang} setLang={setLang} scrolled={scrolled} t={t} />

      <main className="pageContent">
        <HeroSection t={t} />

        <section className="contentSection" id="chart">
          <div className="sectionIntro">
            <p className="sectionLabel">{t.form.sectionLabel}</p>
            <h2 className="sectionTitle">{t.form.title}</h2>
            <p className="sectionText">{t.form.subtitle}</p>
          </div>

          <form className="birthForm" onSubmit={handleSubmit}>
            <div className="fieldBlock">
              <label className="fieldLabel" htmlFor="name">
                {t.form.name}
              </label>
              <input
                id="name"
                className="fieldInput"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={t.form.placeholders.name}
                autoComplete="name"
              />
            </div>

            <div className="fieldGrid">
              <div className="fieldBlock">
                <label className="fieldLabel" htmlFor="birthDate">
                  {t.form.birthDate}
                </label>
                <input
                  id="birthDate"
                  className="fieldInput"
                  type="date"
                  value={birthDate}
                  onChange={(event) => setBirthDate(event.target.value)}
                />
              </div>

              <div className="fieldBlock">
                <label className="fieldLabel" htmlFor="birthTime">
                  {t.form.birthTime}
                </label>
                <input
                  id="birthTime"
                  className="fieldInput"
                  type="time"
                  value={birthTime}
                  onChange={(event) => setBirthTime(event.target.value)}
                />
              </div>
            </div>

            <div className="fieldGrid">
              <div className="fieldBlock">
                <label className="fieldLabel" htmlFor="birthCity">
                  {t.form.birthCity}
                </label>
                <input
                  id="birthCity"
                  className="fieldInput"
                  value={birthCity}
                  onChange={(event) => setBirthCity(event.target.value)}
                  placeholder={t.form.placeholders.city}
                  autoComplete="address-level2"
                />
              </div>

              <div className="fieldBlock">
                <label className="fieldLabel" htmlFor="birthCountry">
                  {t.form.birthCountry}
                </label>
                <input
                  id="birthCountry"
                  className="fieldInput"
                  value={birthCountry}
                  onChange={(event) => setBirthCountry(event.target.value)}
                  placeholder={t.form.placeholders.country}
                  autoComplete="country-name"
                />
              </div>
            </div>

            <div className="formActions">
              <button type="submit" className="primaryButton" disabled={loading}>
                {loading ? t.form.loading : t.form.submit}
              </button>
            </div>

            {formMessage ? <p className="formMessage">{formMessage}</p> : null}

            <p className="formHelper">{t.form.helper}</p>
          </form>
        </section>

        <section className="contentSection" id="results">
          <div className="sectionIntro">
            <p className="sectionLabel">{t.results.sectionLabel}</p>
            <h2 className="sectionTitle">{t.results.title}</h2>
            <p className="sectionText">{t.results.subtitle}</p>
          </div>

          <div className="resultsLayout">
            <ChartPreviewOrb />

            <div className="resultsPanel">
              <p className="miniLabel">{t.results.previewTitle}</p>

              {chartData ? (
                <div className="resultBox">
                  <strong>{t.results.chironTitle}</strong>
                  <div>{t.results.sign}: {chartData.chiron.sign}</div>
                  <div>{t.results.degree}: {chartData.chiron.degree}</div>
                  <div>{t.results.house}: {chartData.chiron.house}</div>
                </div>
              ) : null}

              {resolvedLocation ? (
                <div className="resultBox subtle">
                  <strong>{t.results.location}</strong>
                  <div>{resolvedLocation.displayName}</div>
                </div>
              ) : null}

              <div className="insightStack">
                <article className="insightCard">
                  <h3>{t.results.strengths}</h3>
                  <p>
                    {previewData?.strengths ?? t.results.fallbackStrengths}
                  </p>
                </article>

                <article className="insightCard">
                  <h3>{t.results.challenges}</h3>
                  <p>
                    {previewData?.challenges ?? t.results.fallbackChallenges}
                  </p>
                </article>

                <article className="insightCard">
                  <h3>{t.results.patterns}</h3>
                  <p>
                    {previewData?.patterns ?? t.results.fallbackPatterns}
                  </p>
                </article>
              </div>

              <button
                type="button"
                className="primaryButton"
                onClick={() => scrollToId("premium")}
              >
                {t.results.cta}
              </button>
            </div>
          </div>
        </section>

        <section className="contentSection" id="premium">
          <div className="sectionIntro">
            <p className="sectionLabel">{t.premium.sectionLabel}</p>
            <h2 className="sectionTitle">{t.premium.title}</h2>
            <p className="sectionText">{t.premium.subtitle}</p>
          </div>

          <div className="premiumLayout">
            <div className="featureColumn">
              <ul className="featureList">
                {t.premium.features.map((item: string) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <aside className="premiumCard">
              <div className="premiumMeta">
                <span>{t.premium.note}</span>
                <strong>{t.premium.price}</strong>
              </div>

              <p className="miniLabel">{t.premium.checkoutTitle}</p>
              <p className="premiumText">{t.premium.checkoutText}</p>

              <button
                type="button"
                className="primaryButton"
                onClick={() => alert(t.premium.alert)}
              >
                {t.premium.button}
              </button>

              <p className="formHelper">{t.premium.checkoutMeta}</p>
            </aside>
          </div>
        </section>
      </main>

      <footer className="siteFooter">
        <div className="footerIdentity">
          <span className="brandMark small">K</span>
          <div>
            <div className="footerBrandName">Kiron Code</div>
            <div className="footerText">{t.footer.text}</div>
          </div>
        </div>

        <div className="footerRights">{t.footer.rights}</div>
      </footer>
    </div>
  );
}