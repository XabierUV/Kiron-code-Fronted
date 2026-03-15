import type { Lang } from "@/types/chart";
import { copy } from "@/lib/copy";

type HeroSectionProps = {
  lang: Lang;
  onPrimaryClick: () => void;
  onSecondaryClick: () => void;
};

export function HeroSection({
  lang,
  onPrimaryClick,
  onSecondaryClick,
}: HeroSectionProps) {
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
        <button
          type="button"
          className="secondaryButton"
          onClick={onSecondaryClick}
        >
          {t.hero.secondaryCta}
        </button>
      </div>
    </section>
  );
}