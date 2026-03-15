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

      <div className="footerRights">{t.footer.rights}</div>
    </footer>
  );
}