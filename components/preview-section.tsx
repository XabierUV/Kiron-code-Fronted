import type { ChartData, Lang, LocationData, PreviewData } from "@/types/chart";
import { copy } from "@/lib/copy";
import { NatalChartWheel } from "@/components/natal-chart-wheel";

type PreviewSectionProps = {
  lang: Lang;
  chartData: ChartData | null;
  previewData: PreviewData | null;
  resolvedLocation: LocationData | null;
  onPremiumClick: () => void;
  hasPremiumReport: boolean;
};

export function PreviewSection({
  lang,
  chartData,
  previewData,
  resolvedLocation,
  onPremiumClick,
  hasPremiumReport,
}: PreviewSectionProps) {
  const t = copy[lang];
  const hasData = chartData !== null;

  return (
    <section className="contentSection" id="results">
      <div className="sectionIntro">
        <p className="sectionLabel">{t.results.sectionLabel}</p>
        <h2 className="sectionTitle">{t.results.title}</h2>
        <p className="sectionText">{t.results.subtitle}</p>
      </div>

      {!hasData ? (
        <NatalChartWheel chartData={null} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px", minWidth: 0 }}>
          <NatalChartWheel chartData={chartData} fullWidth />

          <article className="insightCard">
            <h3>{t.results.strengths}</h3>
            <p>{previewData?.strengths ?? t.results.fallbackStrengths}</p>
          </article>

          <article className="insightCard">
            <h3>{t.results.challenges}</h3>
            <p>{previewData?.challenges ?? t.results.fallbackChallenges}</p>
          </article>

          <article className="insightCard">
            <h3>{t.results.patterns}</h3>
            <p>{previewData?.patterns ?? t.results.fallbackPatterns}</p>
          </article>

          <button
            type="button"
            className="primaryButton"
            onClick={onPremiumClick}
            style={{
              width: "100%",
              marginTop: "6px",
              minHeight: "64px",
              fontSize: "17px",
            }}
          >
            {hasPremiumReport ? "Ver informe completo" : t.results.cta}
          </button>
        </div>
      )}
    </section>
  );
}
