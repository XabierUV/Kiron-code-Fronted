import type { Lang } from "@/types/chart";
import { copy } from "@/lib/copy";

type HeroSectionProps = {
  lang: Lang;
  onPrimaryClick: () => void;
};

export function HeroSection({ lang, onPrimaryClick }: HeroSectionProps) {
  const t = copy[lang];

  return (
    <section className="heroSection">
      <p className="eyebrow">{t.hero.eyebrow}</p>
      <h1 className="heroTitle">{t.hero.title}</h1>
      <p className="heroSubtitle">{t.hero.subtitle}</p>

      <div className="heroActions">
        <button type="button" className="primaryButton" onClick={onPrimaryClick}>
          {t.hero.primaryCta}
        </button>
      </div>
    </section>
  );
}