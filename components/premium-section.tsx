import type { Lang } from "@/types/chart";
import { copy } from "@/lib/copy";

type PremiumSectionProps = {
  lang: Lang;
  onCheckout: () => void;
  checkoutLoading: boolean;
};

export function PremiumSection({
  lang,
  onCheckout,
  checkoutLoading,
}: PremiumSectionProps) {
  const t = copy[lang];

  return (
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

          <button
            type="button"
            className="primaryButton"
            onClick={onCheckout}
            disabled={checkoutLoading}
          >
            {checkoutLoading ? "Redirigiendo..." : t.premium.button}
          </button>

          <p className="formHelper">{t.premium.checkoutMeta}</p>
        </aside>
      </div>
    </section>
  );
}