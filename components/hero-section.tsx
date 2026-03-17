import type { Lang } from "@/types/chart";
import { copy } from "@/lib/copy";

type HeroSectionProps = {
  lang: Lang;
};

export function HeroSection({ lang }: HeroSectionProps) {
  const t = copy[lang];

  return (
    <section className="heroSection">
      <p className="eyebrow">{t.hero.eyebrow}</p>
      <h1 className="heroTitle">{t.hero.title}</h1>
      <p className="heroSubtitle">{t.hero.subtitle}</p>
    </section>
  );
}
