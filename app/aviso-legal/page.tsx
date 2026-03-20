"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import type { Lang } from "@/types/chart";

export default function AvisoLegalPage() {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>("es");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
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
            <button
              type="button"
              onClick={() => router.back()}
              style={{ background: "none", border: "none", color: "var(--text-faint)", fontSize: "13px", letterSpacing: "0.08em", textTransform: "uppercase", padding: "0 0 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
            >
              ← Volver
            </button>
            <p className="sectionLabel">Legal</p>
            <h1 className="sectionTitle">Aviso Legal</h1>
            <p className="sectionText">Última actualización: marzo 2025</p>
          </div>

          <div className="resultsPanel">
            <article className="insightCard">
              <h3>1. Titular del sitio web</h3>
              <p>
                En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y del Comercio Electrónico (LSSI-CE), se facilitan los siguientes datos del titular:
              </p>
              <ul style={{ margin: "12px 0 0", paddingLeft: "20px", color: "var(--text-soft)", lineHeight: "1.8" }}>
                <li><strong style={{ color: "var(--text)" }}>Denominación:</strong> Kiron Code</li>
                <li><strong style={{ color: "var(--text)" }}>Correo electrónico:</strong>{" "}
                  <a href="mailto:hello@kironcode.com" style={{ textDecoration: "underline" }}>hello@kironcode.com</a>
                </li>
                <li><strong style={{ color: "var(--text)" }}>Sitio web:</strong> kironcode.com</li>
              </ul>
            </article>

            <article className="insightCard">
              <h3>2. Objeto y ámbito de aplicación</h3>
              <p>
                El presente Aviso Legal regula el acceso y uso del sitio web kironcode.com y de todos los servicios ofrecidos en él. El acceso al sitio implica la aceptación de las condiciones aquí descritas.
              </p>
            </article>

            <article className="insightCard">
              <h3>3. Propiedad intelectual e industrial</h3>
              <p>
                Todos los contenidos del sitio web (textos, imágenes, gráficos, código fuente, diseño, logotipos y demás elementos) son propiedad de Kiron Code o de terceros que han autorizado su uso, y están protegidos por la legislación vigente en materia de propiedad intelectual e industrial.
              </p>
              <p style={{ marginTop: "12px" }}>
                Queda expresamente prohibida la reproducción total o parcial, distribución, comunicación pública, transformación o cualquier otro acto de explotación de dichos contenidos sin la autorización previa y escrita de Kiron Code.
              </p>
            </article>

            <article className="insightCard">
              <h3>4. Exclusión de garantías y responsabilidad</h3>
              <p>
                Kiron Code no garantiza la ausencia de errores en el acceso al sitio ni en sus contenidos. No nos hacemos responsables de los daños o perjuicios derivados del uso o imposibilidad de uso del sitio, de los errores u omisiones en los contenidos, ni de la presencia de virus o elementos lesivos.
              </p>
            </article>

            <article className="insightCard">
              <h3>5. Política de enlaces</h3>
              <p>
                El sitio puede contener enlaces a sitios web de terceros. Kiron Code no controla ni es responsable del contenido de dichos sitios. La inclusión de un enlace no implica ninguna recomendación o asociación con el sitio enlazado.
              </p>
            </article>

            <article className="insightCard">
              <h3>6. Legislación aplicable</h3>
              <p>
                Este Aviso Legal se rige por la legislación española. Para cualquier controversia derivada del acceso o uso de este sitio web, las partes se someten a los tribunales competentes de conformidad con la normativa vigente.
              </p>
            </article>

            <article className="insightCard">
              <h3>7. Contacto</h3>
              <p>
                Para cualquier consulta relativa a este aviso legal:{" "}
                <a href="mailto:hello@kironcode.com" style={{ textDecoration: "underline" }}>hello@kironcode.com</a>
              </p>
            </article>
          </div>
        </section>
      </main>

      <SiteFooter lang={lang} />
    </div>
  );
}
