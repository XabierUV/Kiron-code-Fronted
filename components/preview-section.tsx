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

function formatPointLine(
  label: string,
  sign?: string | null,
  degree?: number | null,
  house?: number | null
) {
  if (!sign || degree == null || house == null) return null;

  return `${label}: ${sign} · ${degree.toFixed(2)}° · Casa ${house}`;
}

export function PreviewSection({
  lang,
  chartData,
  previewData,
  resolvedLocation,
  onPremiumClick,
  hasPremiumReport,
}: PreviewSectionProps) {
  const t = copy[lang];

  const sun = chartData?.points?.sun;
  const moon = chartData?.points?.moon;
  const asc = chartData?.angles?.ascendant;

  const sunLine = formatPointLine("Sol", sun?.sign, sun?.degreeInSign, sun?.house);
  const moonLine = formatPointLine("Luna", moon?.sign, moon?.degreeInSign, moon?.house);
  const chironLine = chartData?.chiron
    ? `Quirón: ${chartData.chiron.sign} · ${chartData.chiron.degree.toFixed(2)}° · Casa ${chartData.chiron.house}`
    : null;

  const ascLine =
    asc?.sign && asc?.degreeInSign != null
      ? `Ascendente: ${asc.sign} · ${asc.degreeInSign.toFixed(2)}°`
      : null;

  return (
    <section className="contentSection" id="results">
      <div className="sectionIntro">
        <p className="sectionLabel">{t.results.sectionLabel}</p>
        <h2 className="sectionTitle">{t.results.title}</h2>
        <p className="sectionText">{t.results.subtitle}</p>
      </div>

      <div className="resultsLayout" style={{ minWidth: 0 }}>
        <NatalChartWheel chartData={chartData} />

        <div className="resultsPanel" style={{ minWidth: 0 }}>
          <p className="miniLabel">{t.results.previewTitle}</p>

          {chartData ? (
            <div className="resultBox">
              <strong>{t.results.chironTitle}</strong>
              <div>
                {t.results.sign}: {chartData.chiron.sign}
              </div>
              <div>
                {t.results.degree}: {chartData.chiron.degree.toFixed(2)}
              </div>
              <div>
                {t.results.house}: {chartData.chiron.house}
              </div>
            </div>
          ) : null}

          {chartData ? (
            <div className="resultBox subtle">
              <strong>Base natal</strong>
              {sunLine ? <div>{sunLine}</div> : null}
              {moonLine ? <div>{moonLine}</div> : null}
              {ascLine ? <div>{ascLine}</div> : null}
              {chironLine ? <div>{chironLine}</div> : null}
            </div>
          ) : null}

          {resolvedLocation ? (
            <div className="resultBox subtle">
              <strong>{t.results.location}</strong>
              <div>{resolvedLocation.displayName}</div>
            </div>
          ) : null}

          <div className="insightStack">
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
          </div>

          <button
            type="button"
            className="primaryButton"
            onClick={onPremiumClick}
            style={{
              width: "100%",
              marginTop: "32px",
              minHeight: "64px",
              fontSize: "17px",
            }}
          >
            {hasPremiumReport ? "Ver informe completo" : t.results.cta}
          </button>
        </div>
      </div>
    </section>
  );
}