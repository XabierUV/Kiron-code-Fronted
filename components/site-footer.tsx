import type { Lang } from "@/types/chart";
import { copy } from "@/lib/copy";

type SiteFooterProps = {
  lang: Lang;
};

export function SiteFooter({ lang }: SiteFooterProps) {
  const t = copy[lang];

  return (
    <footer className="siteFooter">
      <div className="footerIdentity">
        <span className="brandMark small">K</span>
        <div>
          <div className="footerBrandName">Kiron Code</div>
          <div className="footerText">{t.footer.text}</div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "20px", marginTop: "16px", flexWrap: "wrap" }}>
        <a href="/privacidad" className="footerText" style={{ textDecoration: "underline" }}>Política de Privacidad</a>
        <a href="/terminos" className="footerText" style={{ textDecoration: "underline" }}>Términos y Condiciones</a>
        <a href="/aviso-legal" className="footerText" style={{ textDecoration: "underline" }}>Aviso Legal</a>

        <div style={{ display: "flex", gap: "16px", alignItems: "center", marginLeft: "auto" }}>
          <a
            href="https://tiktok.com/@kironcode"
            target="_blank"
            rel="noreferrer"
            aria-label="TikTok"
            style={{ color: "rgba(255,255,255,0.48)", transition: "color 160ms ease" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.9)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.48)")}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.19 8.19 0 0 0 4.79 1.52V6.76a4.85 4.85 0 0 1-1.02-.07z" />
            </svg>
          </a>

          <a
            href="https://instagram.com/kironcode"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            style={{ color: "rgba(255,255,255,0.48)", transition: "color 160ms ease" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.9)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.48)")}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
            </svg>
          </a>

          <a
            href="https://youtube.com/@kironcode"
            target="_blank"
            rel="noreferrer"
            aria-label="YouTube"
            style={{ color: "rgba(255,255,255,0.48)", transition: "color 160ms ease" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.9)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.48)")}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M23 7s-.3-1.9-1.1-2.7c-1.1-1.1-2.3-1.1-2.8-1.2C16.3 3 12 3 12 3s-4.3 0-7.1.2c-.6.1-1.8.1-2.8 1.2C1.3 5.1 1 7 1 7S.7 9.1.7 11.3v2c0 2.1.3 4.3.3 4.3s.3 1.9 1.1 2.7c1.1 1.1 2.5 1.1 3.1 1.1C7.2 21.6 12 21.7 12 21.7s4.3 0 7.1-.2c.6-.1 1.8-.1 2.8-1.2.8-.8 1.1-2.7 1.1-2.7s.3-2.1.3-4.3v-2C23.3 9.1 23 7 23 7zM9.7 15.5V8.3l7.6 3.6-7.6 3.6z" />
            </svg>
          </a>
        </div>
      </div>

      <div className="footerRights">{t.footer.rights}</div>
    </footer>
  );
}
