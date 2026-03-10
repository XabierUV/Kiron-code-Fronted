"use client";
import React, { useEffect, useMemo, useState } from "react";

type Lang = "es" | "en";

const copy = {
  es: {
    nav: { chart: "Carta", results: "Resultados", premium: "Premium" },
    hero: {
      title: "Descubre tu Mapa Cósmico",
      subtitle:
        "Kiron Code revela tu perfil astrológico personal a partir de tus datos de nacimiento.",
      cta: "Revelar mi carta"
    },
    form: {
      title: "Introduce tus datos",
      subtitle: "Tu fecha, hora y ciudad de nacimiento nos permiten preparar tu carta.",
      name: "Nombre",
      birthDate: "Fecha de nacimiento",
      birthTime: "Hora de nacimiento",
      birthCity: "Ciudad de nacimiento",
      btn: "Ver mi Kiron Code"
    },
    results: {
      title: "Tu vista previa",
      blurb:
        "Aquí verás tu carta y un adelanto de la interpretación: fortalezas, retos y patrones que se repiten."
    },
    premium: {
      title: "Desbloquea el informe completo",
      blurb: "Profundiza con un análisis claro y estructurado para releer cuando lo necesites.",
      items: [
        "Análisis completo de carta natal",
        "Rasgos de personalidad y talentos",
        "Ciclos vitales y momentos clave",
        "Compatibilidad: amor y carrera"
      ],
      btn: "Pasar a Premium",
      note: "Pago único. Sin suscripción."
    },
    footer: {
      sub: "Tu destino, explicado con claridad.",
      rights: `© ${new Date().getFullYear()} Kiron Code. Todos los derechos reservados.`
    }
  },
  en: {
    nav: { chart: "Chart", results: "Results", premium: "Premium" },
    hero: {
      title: "Discover Your Cosmic Blueprint",
      subtitle:
        "Kiron Code reveals your personal astrological profile using your birth data.",
      cta: "Reveal my chart"
    },
    form: {
      title: "Enter your details",
      subtitle: "Your birth date, time and city help us prepare your chart.",
      name: "Name",
      birthDate: "Birth date",
      birthTime: "Birth time",
      birthCity: "Birth city",
      btn: "See my Kiron Code"
    },
    results: {
      title: "Your preview",
      blurb:
        "You’ll see your chart and a short interpretation preview: strengths, challenges, and recurring patterns."
    },
    premium: {
      title: "Unlock the full report",
      blurb: "A clear, structured deep dive you can revisit anytime.",
      items: [
        "Full natal chart analysis",
        "Personality insights & talents",
        "Life cycles & key timing",
        "Compatibility: love & career"
      ],
      btn: "Upgrade to Premium",
      note: "One-time payment. No subscription."
    },
    footer: {
      sub: "Your destiny, clearly explained.",
      rights: `© ${new Date().getFullYear()} Kiron Code. All rights reserved.`
    }
  }
} satisfies Record<Lang, any>;

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function IconLink({
  href,
  label,
  children
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a className="iconLink" href={href} target="_blank" rel="noreferrer" aria-label={label} title={label}>
      {children}
    </a>
  );
}

function SimpleIcon({ name }: { name: "ig" | "tt" | "yt" | "x" | "in" }) {
  const paths: Record<string, string> = {
    ig: "M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm5 5.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6zM17.8 6.3a.9.9 0 1 0 0 1.8.9.9 0 0 0 0-1.8z",
    tt: "M14.5 3v2.2c1.4 1 2.8 1.5 4.5 1.6v3.3c-1.8 0-3.3-.5-4.5-1.3v6.6c0 3-2.4 5.4-5.4 5.4S3.7 18.4 3.7 15.4c0-2.7 2-5 4.7-5.4v3.6c-.7.3-1.2 1-1.2 1.8 0 1.1.9 2 2 2s2-.9 2-2V3h3.3z",
    yt: "M21 8.2a3 3 0 0 0-2.1-2.1C17 5.6 12 5.6 12 5.6s-5 0-6.9.5A3 3 0 0 0 3 8.2 31 31 0 0 0 3 12a31 31 0 0 0 .1 3.8A3 3 0 0 0 5.2 18c1.9.5 6.8.5 6.8.5s5 0 6.9-.5A3 3 0 0 0 21 15.8 31 31 0 0 0 21.1 12 31 31 0 0 0 21 8.2zM10.5 14.8V9.2L15.2 12l-4.7 2.8z",
    x: "M18.6 3H21l-5.5 6.3L21.8 21H16l-4.6-6-5.2 6H3.8l6-6.9L2.2 3h5.9l4.2 5.2L18.6 3z",
    in: "M4 3.5A2.5 2.5 0 1 0 4 8.5a2.5 2.5 0 0 0 0-5zM2.5 21h3V9.5h-3V21zM9 9.5h2.9v1.6h.1c.4-.8 1.5-1.8 3.2-1.8 3.4 0 4 2.2 4 5.1V21h-3v-5.8c0-1.4 0-3.1-1.9-3.1s-2.2 1.5-2.2 3V21H9V9.5z"
  };
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" role="img" aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  );
}

export default function Page() {

  const [lang, setLang] = useState<Lang>("es");
const [scrolled, setScrolled] = useState(false);
const [name, setName] = useState("");
const [birthDate, setBirthDate] = useState("");
const [birthTime, setBirthTime] = useState("");
const [birthCity, setBirthCity] = useState("");
const [loading, setLoading] = useState(false);
const [formMessage, setFormMessage] = useState("");
const [birthCountry, setBirthCountry] = useState("");
const [resolvedLocation, setResolvedLocation] = useState<null | {
  displayName: string;
  latitude: number;
  longitude: number;
  timezone: string;
}>(null);
const [chartData, setChartData] = useState<null | {
  chiron: {
    sign: string;
    degree: number;
    house: number;
  };
}>(null);
  const [previewData, setPreviewData] = useState<null | {
  strengths: string;
  challenges: string;
  patterns: string;
}>(null);

const t = useMemo(() => copy[lang], [lang]);
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
    };

    onScroll();
    window.addEventListener("scroll", onScroll);

    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  // Cambia estas URLs a tus redes cuando las tengas
  const socials = {
    instagram: "https://instagram.com/",
    tiktok: "https://www.tiktok.com/",
    youtube: "https://www.youtube.com/",
    x: "https://x.com/",
    linkedin: "https://www.linkedin.com/"
  };

  return (
    <div className="page">
     <header className={`nav ${scrolled ? "navScrolled" : ""}`}>
        <div className="brand" onClick={() => scrollToId("top")} role="button" tabIndex={0}>
          <img src="/brand/logo-kironcode.svg" alt="Kiron Code" />
        </div>

        <nav className="navLinks" aria-label="Primary">
          <button className="navBtn" onClick={() => scrollToId("chart")}>{t.nav.chart}</button>
          <button className="navBtn" onClick={() => scrollToId("results")}>{t.nav.results}</button>
          <button className="navBtn" onClick={() => scrollToId("premium")}>{t.nav.premium}</button>
        </nav>

        <div className="navRight">
          <div className="langToggle" role="group" aria-label="Language toggle">
            <button className={`pill ${lang === "es" ? "active" : ""}`} onClick={() => setLang("es")}>ES</button>
            <button className={`pill ${lang === "en" ? "active" : ""}`} onClick={() => setLang("en")}>EN</button>
          </div>

          <div className="navIcons">
            
          </div>
        </div>
      </header>

      <main
  id="top"
  className="wrap"
  style={{
    backgroundImage: "url('/fondo.png')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "repeat"
  }}
  >      
        {/* 1) HERO */}
        <section className="hero">
          <div className="heroCard">
            <h1 className="h1">{t.hero.title}</h1>
            <p className="sub">{t.hero.subtitle}</p>
            <div className="ctaRow">
              <button className="cta" onClick={() => scrollToId("chart")}>{t.hero.cta}</button>
              <button className="ghost" onClick={() => scrollToId("premium")}>{t.nav.premium}</button>
            </div>
            <div className="heroHint">Scroll ↓</div>
          </div>
        </section>

        {/* 2) FORM */}
        <section className="section" id="chart">
          <div className="grid2">
            <div className="panel">
              <h2 className="h2">{t.form.title}</h2>
              <p className="sub">{t.form.subtitle}</p>

 <form
  className="form"
  onSubmit={async (e) => {
    e.preventDefault();
    setFormMessage("");
    setResolvedLocation(null);
    setChartData(null);
    setPreviewData(null);

    if (!name || !birthDate || !birthTime || !birthCity || !birthCountry) {
      setFormMessage(
        lang === "es"
          ? "Completa todos los campos para continuar."
          : "Please complete all fields to continue."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("https://luminous-patience-production.up.railway.app/chart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          birthDate,
          birthTime,
          birthCity,
          birthCountry
        })
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(
          data.error ||
            (lang === "es"
              ? "No hemos podido generar tu Kiron Code."
              : "We could not generate your Kiron Code.")
        );
      }

      setResolvedLocation(data.location);
      setChartData(data.chart);
      setPreviewData(data.preview);

      setFormMessage(
        lang === "es"
          ? "Kiron Code generado correctamente."
          : "Kiron Code generated successfully."
      );

      scrollToId("results");
    } catch (error) {
      setFormMessage(
        error instanceof Error
          ? error.message
          : lang === "es"
          ? "Ha ocurrido un error inesperado."
          : "An unexpected error occurred."
      );
    } finally {
      setLoading(false);
    }
  }}
>
  <label className="field">
    <span className="label">{t.form.name}</span>
    <input
      className="input"
      placeholder={lang === "es" ? "Tu nombre" : "Your name"}
      value={name}
      onChange={(e) => setName(e.target.value)}
    />
  </label>

  <div className="row2">
    <label className="field">
      <span className="label">{t.form.birthDate}</span>
      <input
        className="input"
        type="date"
        value={birthDate}
        onChange={(e) => setBirthDate(e.target.value)}
      />
    </label>

    <label className="field">
      <span className="label">{t.form.birthTime}</span>
      <input
        className="input"
        type="time"
        value={birthTime}
        onChange={(e) => setBirthTime(e.target.value)}
      />
    </label>
  </div>

  <div className="row2">
    <label className="field">
      <span className="label">{t.form.birthCity}</span>
      <input
        className="input"
        placeholder={lang === "es" ? "Ej. Bilbao" : "e.g., Bilbao"}
        value={birthCity}
        onChange={(e) => setBirthCity(e.target.value)}
      />
    </label>

    <label className="field">
      <span className="label">
        {lang === "es" ? "País de nacimiento" : "Birth country"}
      </span>
      <input
        className="input"
        placeholder={lang === "es" ? "Ej. España" : "e.g., Spain"}
        value={birthCountry}
        onChange={(e) => setBirthCountry(e.target.value)}
      />
    </label>
  </div>

  <button className="cta" type="submit" disabled={loading}>
    {loading
      ? lang === "es"
        ? "Generando..."
        : "Generating..."
      : t.form.btn}
  </button>

  {formMessage ? (
    <p className="formMessage">{formMessage}</p>
  ) : null}

  <p className="micro">
    {lang === "es"
      ? "Al continuar aceptas nuestras condiciones y la política de privacidad."
      : "By continuing you agree to our terms and privacy policy."}
  </p>
</form>
            </div>
          </div>
        </section>
        {/* 3) RESULTS */}
        <section className="section" id="results">
          <div className="panel">
            <h2 className="h2">{t.results.title}</h2>
            <p className="sub">{t.results.blurb}</p>

            <div className="resultsGrid">
              <div className="chartMock" aria-label="Astrology chart preview (mock)">
                <div className="ring r1" />
                <div className="ring r2" />
                <div className="ring r3" />
                <div className="dot d1" />
                <div className="dot d2" />
                <div className="dot d3" />
                <div className="dot d4" />
                <div className="dot d5" />
                <div className="dot d6" />
                <div className="centerGlow" />
              </div>

              <div>
                <div className="miniTitle">{lang === "es" ? "Adelanto" : "Preview"}</div>
{chartData ? (
  <div className="note">
    <strong>{lang === "es" ? "Tu Quirón" : "Your Chiron"}</strong>
    <br />
    {lang === "es" ? "Signo" : "Sign"}: {chartData.chiron.sign}
    <br />
    {lang === "es" ? "Grado" : "Degree"}: {chartData.chiron.degree}
    <br />
    {lang === "es" ? "Casa" : "House"}: {chartData.chiron.house}
  </div>
) : null}
 <div className="cards">
  <div className="card">
    <div className="cardTitle">{lang === "es" ? "Fortalezas" : "Strengths"}</div>
    <div className="cardBody">
      {previewData
        ? previewData.strengths
        : lang === "es"
        ? "Capacidad de decisión cuando alineas intuición y propósito."
        : "Decisiveness when intuition and purpose align."}
    </div>
  </div>

  <div className="card">
    <div className="cardTitle">{lang === "es" ? "Retos" : "Challenges"}</div>
    <div className="cardBody">
      {previewData
        ? previewData.challenges
        : lang === "es"
        ? "Elegir el momento: no todo se fuerza, el destino se abre."
        : "Timing matters: not everything is forced—destiny opens."}
    </div>
  </div>

  <div className="card">
    <div className="cardTitle">{lang === "es" ? "Patrones" : "Patterns"}</div>
    <div className="cardBody">
      {previewData
        ? previewData.patterns
        : lang === "es"
        ? "Ciclos que se repiten en amor, trabajo y cambios importantes."
        : "Recurring cycles across love, work, and major shifts."}
    </div>
  </div>
</div>

                <button className="cta" onClick={() => scrollToId("premium")}>{t.premium.btn}</button>
              </div>
            </div>
          </div>
        </section>

        {/* 4) PREMIUM */}
        <section className="section" id="premium">
          <div className="panel">
            <div className="premiumHeader">
              <h2 className="h2">{t.premium.title}</h2>
              <div className="pricePill">{t.premium.note} · <strong>19€</strong></div>
            </div>

            <p className="sub">{t.premium.blurb}</p>

            <div className="premiumGrid">
              <ul className="features">
                {t.premium.items.map((x: string) => <li key={x}>{x}</li>)}
              </ul>

              <div className="checkoutBox">
                <div className="miniTitle">{lang === "es" ? "Premium" : "Premium"}</div>
                <p className="sub">
                  {lang === "es"
                    ? "Aquí luego conectaremos Stripe. De momento esto es solo la estética."
                    : "We’ll connect Stripe later. For now, this is aesthetic only."}
                </p>
                <button className="cta" onClick={() => alert(lang === "es" ? "Solo frontend por ahora." : "Frontend only for now.")}>
                  {t.premium.btn}
                </button>
                <p className="micro">
                  {lang === "es" ? "Seguro · Rápido · Acceso inmediato" : "Secure · Fast · Instant access"}
                </p>
              </div>
            </div>
          </div>
        </section>

 {/* 5) FOOTER */}
<footer className="footer">
  <div className="footerTop">
    <div className="footerBrand">
      <img
        className="footerMark"
        src="/brand/mark-k.svg"
        alt="Kiron Code mark"
      />
      <div>
        <div className="footerTitle">Kiron Code</div>
        <div className="footerSub">{t.footer.sub}</div>
      </div>
    </div>
  </div>

  <div className="footerBottom">{t.footer.rights}</div>
</footer>
    </main>
</div>
);
}
