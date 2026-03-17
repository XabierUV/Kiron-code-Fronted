"use client";

import { useState, useEffect } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import type { Lang } from "@/types/chart";

export default function TerminosPage() {
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
            <h1 className="sectionTitle">Términos y Condiciones</h1>
            <p className="sectionText">Última actualización: marzo 2025</p>
          </div>

          <div className="resultsPanel">
            <article className="insightCard">
              <h3>1. Aceptación</h3>
              <p>
                Al acceder y utilizar los servicios de <strong>Kiron Code</strong> y al realizar cualquier compra en kironcode.com, aceptas estos Términos y Condiciones en su totalidad. Si no estás de acuerdo, te rogamos que no uses el servicio.
              </p>
            </article>

            <article className="insightCard">
              <h3>2. Descripción del servicio</h3>
              <p>
                Kiron Code ofrece informes de astrología psicológica generados algorítmicamente a partir de los datos de nacimiento proporcionados por el usuario. Los productos disponibles son:
              </p>
              <ul style={{ margin: "12px 0 0", paddingLeft: "20px", color: "var(--text-soft)", lineHeight: "1.8" }}>
                <li><strong style={{ color: "var(--text)" }}>Tu Quirón</strong> — Incluido gratuitamente con el registro</li>
                <li><strong style={{ color: "var(--text)" }}>La Herida y el Don</strong> — 19 € (pago único)</li>
                <li><strong style={{ color: "var(--text)" }}>Tu Mapa Interior</strong> — 39 € (pago único)</li>
                <li><strong style={{ color: "var(--text)" }}>El Vínculo</strong> — 59 € (pago único)</li>
                <li><strong style={{ color: "var(--text)" }}>Kiron Vivo</strong> — 9 €/mes (suscripción mensual)</li>
              </ul>
            </article>

            <article className="insightCard">
              <h3>3. Proceso de compra</h3>
              <p>
                Los precios mostrados incluyen el IVA aplicable. El pago se procesa de forma segura a través de Stripe. Al completar el proceso de pago, recibirás una confirmación por email y acceso inmediato al contenido adquirido.
              </p>
            </article>

            <article className="insightCard">
              <h3>4. Política de reembolsos</h3>
              <p>
                Los informes de Kiron Code son <strong>productos digitales entregados de forma inmediata</strong> tras el pago. De conformidad con el artículo 103.m) del Real Decreto Legislativo 1/2007, de 16 de noviembre (TRLGDCU), el derecho de desistimiento no es aplicable a contenidos digitales cuya ejecución ha comenzado con el consentimiento previo y expreso del consumidor.
              </p>
              <p style={{ marginTop: "12px" }}>
                Por tanto, <strong>no se aplican reembolsos</strong> una vez que el informe ha sido generado y entregado, salvo en caso de error técnico imputable a Kiron Code que impida el acceso al producto comprado. En ese caso, contáctanos en{" "}
                <a href="mailto:hello@kironcode.com" style={{ textDecoration: "underline" }}>hello@kironcode.com</a>{" "}
                y lo resolveremos.
              </p>
            </article>

            <article className="insightCard">
              <h3>5. Suscripción Kiron Vivo</h3>
              <p>
                La suscripción <strong>Kiron Vivo</strong> (9 €/mes) se renueva automáticamente cada mes. Puedes cancelarla en cualquier momento desde tu portal de cliente o escribiendo a{" "}
                <a href="mailto:hello@kironcode.com" style={{ textDecoration: "underline" }}>hello@kironcode.com</a>.
                La cancelación será efectiva al final del período de facturación en curso; no se realizarán reembolsos por el período no consumido.
              </p>
            </article>

            <article className="insightCard">
              <h3>6. Naturaleza del contenido</h3>
              <p>
                Los informes de Kiron Code son de naturaleza interpretativa y están destinados al entretenimiento y la reflexión personal. No constituyen asesoramiento psicológico, médico, financiero ni de ningún otro tipo. Kiron Code no se hace responsable de las decisiones que el usuario tome basándose en el contenido de los informes.
              </p>
            </article>

            <article className="insightCard">
              <h3>7. Propiedad intelectual</h3>
              <p>
                Todo el contenido de kironcode.com, incluyendo textos, diseño, logotipos y software, es propiedad de Kiron Code o de sus licenciantes y está protegido por la legislación de propiedad intelectual. Queda prohibida su reproducción, distribución o comunicación pública sin autorización expresa.
              </p>
              <p style={{ marginTop: "12px" }}>
                El informe generado para el usuario es para su uso personal exclusivo. No puede ser revendido ni redistribuido.
              </p>
            </article>

            <article className="insightCard">
              <h3>8. Limitación de responsabilidad</h3>
              <p>
                Kiron Code no garantiza la disponibilidad ininterrumpida del servicio. En ningún caso nuestra responsabilidad total excederá el importe pagado por el usuario en los últimos 12 meses.
              </p>
            </article>

            <article className="insightCard">
              <h3>9. Legislación aplicable y jurisdicción</h3>
              <p>
                Estos términos se rigen por la legislación española. Para la resolución de conflictos, las partes se someten a los juzgados y tribunales competentes según la normativa vigente. Para usuarios consumidores, también está disponible la plataforma de resolución de litigios en línea de la Unión Europea.
              </p>
            </article>

            <article className="insightCard">
              <h3>10. Contacto</h3>
              <p>
                Para cualquier consulta sobre estos términos:{" "}
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
