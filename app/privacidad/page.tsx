"use client";

import { useState, useEffect } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import type { Lang } from "@/types/chart";

export default function PrivacidadPage() {
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
            <p className="sectionLabel">Legal</p>
            <h1 className="sectionTitle">Política de Privacidad</h1>
            <p className="sectionText">Última actualización: marzo 2025</p>
          </div>

          <div className="resultsPanel">
            <article className="insightCard">
              <h3>1. Responsable del tratamiento</h3>
              <p>
                <strong>Kiron Code</strong><br />
                Correo electrónico de contacto: <a href="mailto:hello@kironcode.com" style={{ textDecoration: "underline" }}>hello@kironcode.com</a>
              </p>
            </article>

            <article className="insightCard">
              <h3>2. Datos que recopilamos</h3>
              <p>
                Recopilamos los siguientes datos personales cuando utilizas nuestro servicio:
              </p>
              <ul style={{ margin: "12px 0 0", paddingLeft: "20px", color: "var(--text-soft)", lineHeight: "1.8" }}>
                <li>Nombre</li>
                <li>Dirección de correo electrónico</li>
                <li>Fecha, hora y lugar de nacimiento</li>
                <li>Datos de pago (procesados por Stripe; no almacenamos datos de tarjeta)</li>
              </ul>
            </article>

            <article className="insightCard">
              <h3>3. Finalidad y base jurídica</h3>
              <p>
                Tratamos tus datos para las siguientes finalidades, con sus correspondientes bases jurídicas según el RGPD:
              </p>
              <ul style={{ margin: "12px 0 0", paddingLeft: "20px", color: "var(--text-soft)", lineHeight: "1.8" }}>
                <li><strong style={{ color: "var(--text)" }}>Generación de la carta natal:</strong> ejecución del contrato (art. 6.1.b RGPD)</li>
                <li><strong style={{ color: "var(--text)" }}>Entrega de informes premium:</strong> ejecución del contrato (art. 6.1.b RGPD)</li>
                <li><strong style={{ color: "var(--text)" }}>Envío del informe por email:</strong> ejecución del contrato (art. 6.1.b RGPD)</li>
                <li><strong style={{ color: "var(--text)" }}>Comunicaciones comerciales:</strong> consentimiento (art. 6.1.a RGPD)</li>
              </ul>
            </article>

            <article className="insightCard">
              <h3>4. Conservación de datos</h3>
              <p>
                Conservamos tus datos mientras exista una relación contractual activa y, una vez finalizada, durante los plazos legalmente exigidos (hasta 5 años para obligaciones fiscales y contables). Los datos de carta natal se conservan para permitirte acceder de nuevo a tus informes.
              </p>
            </article>

            <article className="insightCard">
              <h3>5. Destinatarios</h3>
              <p>
                No vendemos ni cedemos tus datos a terceros. Compartimos información únicamente con los siguientes proveedores de servicios que actúan como encargados del tratamiento:
              </p>
              <ul style={{ margin: "12px 0 0", paddingLeft: "20px", color: "var(--text-soft)", lineHeight: "1.8" }}>
                <li><strong style={{ color: "var(--text)" }}>Stripe:</strong> pasarela de pago</li>
                <li><strong style={{ color: "var(--text)" }}>Railway / Vercel:</strong> infraestructura de alojamiento</li>
                <li><strong style={{ color: "var(--text)" }}>Resend / servicio de email:</strong> envío de informes y notificaciones</li>
              </ul>
            </article>

            <article className="insightCard">
              <h3>6. Transferencias internacionales</h3>
              <p>
                Algunos de nuestros proveedores pueden estar ubicados fuera del Espacio Económico Europeo. En estos casos, nos aseguramos de que existan garantías adecuadas conforme al RGPD (cláusulas contractuales tipo o decisiones de adecuación de la Comisión Europea).
              </p>
            </article>

            <article className="insightCard">
              <h3>7. Tus derechos</h3>
              <p>
                De acuerdo con el RGPD, tienes derecho a:
              </p>
              <ul style={{ margin: "12px 0 0", paddingLeft: "20px", color: "var(--text-soft)", lineHeight: "1.8" }}>
                <li><strong style={{ color: "var(--text)" }}>Acceso:</strong> obtener confirmación sobre si tratamos tus datos y acceder a ellos</li>
                <li><strong style={{ color: "var(--text)" }}>Rectificación:</strong> corregir datos inexactos</li>
                <li><strong style={{ color: "var(--text)" }}>Supresión:</strong> solicitar el borrado de tus datos ("derecho al olvido")</li>
                <li><strong style={{ color: "var(--text)" }}>Limitación:</strong> restringir el tratamiento en determinadas circunstancias</li>
                <li><strong style={{ color: "var(--text)" }}>Portabilidad:</strong> recibir tus datos en formato estructurado</li>
                <li><strong style={{ color: "var(--text)" }}>Oposición:</strong> oponerte al tratamiento basado en interés legítimo</li>
                <li><strong style={{ color: "var(--text)" }}>Retirar el consentimiento</strong> en cualquier momento, sin que ello afecte a la licitud del tratamiento previo</li>
              </ul>
              <p style={{ marginTop: "12px" }}>
                Para ejercer tus derechos, escríbenos a{" "}
                <a href="mailto:hello@kironcode.com" style={{ textDecoration: "underline" }}>hello@kironcode.com</a>.
                También puedes presentar una reclamación ante la Agencia Española de Protección de Datos (AEPD) en{" "}
                <a href="https://www.aepd.es" target="_blank" rel="noreferrer" style={{ textDecoration: "underline" }}>www.aepd.es</a>.
              </p>
            </article>

            <article className="insightCard">
              <h3>8. Seguridad</h3>
              <p>
                Aplicamos medidas técnicas y organizativas apropiadas para proteger tus datos frente a acceso no autorizado, pérdida o destrucción, incluyendo cifrado en tránsito (HTTPS) y en reposo.
              </p>
            </article>

            <article className="insightCard">
              <h3>9. Cookies</h3>
              <p>
                Kiron Code utiliza únicamente cookies técnicas estrictamente necesarias para el funcionamiento del servicio. No empleamos cookies de seguimiento ni publicidad de terceros.
              </p>
            </article>

            <article className="insightCard">
              <h3>10. Cambios en esta política</h3>
              <p>
                Podemos actualizar esta política periódicamente. Cuando lo hagamos, revisaremos la fecha de "última actualización" en la parte superior. Te recomendamos revisar esta página de forma ocasional.
              </p>
            </article>
          </div>
        </section>
      </main>

      <SiteFooter lang={lang} />
    </div>
  );
}
