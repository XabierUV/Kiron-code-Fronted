import type { ChartData, ChartPoint, Lang } from "@/types/chart";

type NatalChartWheelProps = {
  chartData: ChartData | null;
  fullWidth?: boolean;
  lang?: Lang;
};

const POINT_ORDER = [
  "sun",
  "moon",
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
  "pluto",
  "chiron",
  "mean_node",
];

const POINT_LABELS: Record<string, string> = {
  sun: "☉",
  moon: "☽",
  mercury: "☿",
  venus: "♀",
  mars: "♂",
  jupiter: "♃",
  saturn: "♄",
  uranus: "♅",
  neptune: "♆",
  pluto: "♇",
  chiron: "⚷",
  mean_node: "☊",
};

function roundCoord(value: number, decimals = 3) {
  return Number(value.toFixed(decimals));
}

function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angleDeg: number
) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;

  return {
    x: roundCoord(cx + radius * Math.cos(angleRad)),
    y: roundCoord(cy + radius * Math.sin(angleRad)),
  };
}

/**
 * Converts an ecliptic longitude to an SVG angle.
 *
 * In a natal chart wheel the Ascendant sits at the 9-o'clock position (270° in
 * SVG polar terms) and the zodiac advances counter-clockwise, so increasing
 * ecliptic longitude maps to *decreasing* SVG angle.
 *
 * Formula: svgAngle = (270 + asc - lon) mod 360
 */
function lonToAngle(lon: number, asc: number): number {
  return ((270 + asc - lon) % 360 + 360) % 360;
}

function getZodiacSignLabel(index: number) {
  const signs = [
    "Ari",
    "Tau",
    "Gem",
    "Can",
    "Leo",
    "Vir",
    "Lib",
    "Sco",
    "Sag",
    "Cap",
    "Aqu",
    "Pis",
  ];

  return signs[index] ?? "";
}

function getPointEntries(chartData: ChartData | null) {
  if (!chartData?.points) return [];

  const validPoints = Object.values(chartData.points).filter(
    (point): point is ChartPoint =>
      Boolean(point) && typeof point.longitude === "number"
  );

  return validPoints.sort((a, b) => {
    const aIndex = POINT_ORDER.indexOf(a.key);
    const bIndex = POINT_ORDER.indexOf(b.key);

    const normalizedA = aIndex === -1 ? 999 : aIndex;
    const normalizedB = bIndex === -1 ? 999 : bIndex;

    return normalizedA - normalizedB;
  });
}

function getPointLabel(point: ChartPoint) {
  return POINT_LABELS[point.key] || point.name;
}

function getStackedPointRadius(index: number) {
  const cycle = index % 3;
  if (cycle === 0) return 112;
  if (cycle === 1) return 100;
  return 124;
}

export function NatalChartWheel({ chartData, fullWidth, lang = "es" }: NatalChartWheelProps) {
  const size = 520;
  const center = 260;

  const outerRadius = 220;
  const zodiacRadius = 190;
  const innerRadius = 145;
  const houseRadius = 122;

  const points = getPointEntries(chartData);
  const houses = chartData?.houses ?? [];
  const ascendant = chartData?.angles?.ascendant?.longitude ?? null;
  const midheaven = chartData?.angles?.midheaven?.longitude ?? null;

  // Reference angle for all ecliptic → SVG conversions.
  // When no chart is loaded yet we default to 0 so the static ring still renders.
  const asc = ascendant ?? 0;

  return (
    <div className="natalWheelWrap" style={fullWidth ? { maxWidth: "none" } : undefined}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="natalWheel"
        role="img"
        aria-label="Natal chart wheel"
      >
        <circle cx={center} cy={center} r={outerRadius} className="wheelOuter" />
        <circle cx={center} cy={center} r={zodiacRadius} className="wheelRing" />
        <circle cx={center} cy={center} r={innerRadius} className="wheelInner" />

        {/* Zodiac ring: 12 signs rotated so that the ASC sign aligns correctly */}
        {Array.from({ length: 12 }, (_, index) => {
          // Each sign boundary is at ecliptic longitude index*30
          const dividerAngle = lonToAngle(index * 30, asc);
          const start = polarToCartesian(center, center, innerRadius, dividerAngle);
          const end = polarToCartesian(center, center, outerRadius, dividerAngle);

          // Label sits at the midpoint of the sign (15° into it, counter-clockwise)
          const labelAngle = lonToAngle(index * 30 + 15, asc);
          const labelPos = polarToCartesian(
            center,
            center,
            (zodiacRadius + outerRadius) / 2,
            labelAngle
          );

          return (
            <g key={`zodiac-${index}`}>
              <line
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                className="wheelDivider"
              />
              <text
                x={labelPos.x}
                y={labelPos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="wheelSignLabel"
              >
                {getZodiacSignLabel(index)}
              </text>
            </g>
          );
        })}

        {/* Zodiac Unicode symbols — inner zodiac ring */}
        {Array.from({ length: 12 }, (_, i) => {
          const ZODIAC_SYMBOLS = ["♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓"];
          const labelAngle = lonToAngle(i * 30 + 15, asc);
          const pos = polarToCartesian(center, center, 168, labelAngle);
          return (
            <text
              key={`usym-${i}`}
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ fill: "rgba(201,167,90,0.65)", fontSize: "12px" }}
            >
              {`${ZODIAC_SYMBOLS[i]}\uFE0E`}
            </text>
          );
        })}

        {/* House cusps */}
        {houses.map((house) => {
          if (typeof house.cuspLongitude !== "number") return null;

          const cuspAngle = lonToAngle(house.cuspLongitude, asc);
          const start = polarToCartesian(center, center, 20, cuspAngle);
          const end = polarToCartesian(center, center, innerRadius, cuspAngle);

          // Label sits slightly counter-clockwise from the cusp (inside the house)
          const labelAngle = lonToAngle(house.cuspLongitude + 12, asc);
          const labelPos = polarToCartesian(center, center, houseRadius, labelAngle);

          return (
            <g key={`house-${house.number}`}>
              <line
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                className="houseDivider"
              />
              <text
                x={labelPos.x}
                y={labelPos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="houseLabel"
              >
                {house.number}
              </text>
            </g>
          );
        })}

        {/* ASC axis – always at 9 o'clock (270° SVG) after rotation */}
        {typeof ascendant === "number" ? (() => {
          const ascAngle = lonToAngle(ascendant, asc); // always 270
          const start = polarToCartesian(center, center, innerRadius, ascAngle);
          const end = polarToCartesian(center, center, outerRadius + 10, ascAngle);
          const label = polarToCartesian(center, center, outerRadius + 24, ascAngle);

          return (
            <g>
              <line
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                className="ascLine"
              />
              <text
                x={label.x}
                y={label.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="angleLabel"
              >
                ASC
              </text>
            </g>
          );
        })() : null}

        {/* MC axis – converted from ecliptic longitude to SVG angle */}
        {typeof midheaven === "number" ? (() => {
          const mcAngle = lonToAngle(midheaven, asc);
          const start = polarToCartesian(center, center, innerRadius, mcAngle);
          const end = polarToCartesian(center, center, outerRadius + 10, mcAngle);
          const label = polarToCartesian(center, center, outerRadius + 24, mcAngle);

          return (
            <g>
              <line
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                className="mcLine"
              />
              <text
                x={label.x}
                y={label.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="angleLabel"
              >
                MC
              </text>
            </g>
          );
        })() : null}

        {/* Planets – Unicode symbols, no dot */}
        {points.map((point, index) => {
          const pointRadius = getStackedPointRadius(index);
          const pos = polarToCartesian(
            center,
            center,
            pointRadius,
            lonToAngle(point.longitude ?? 0, asc)
          );
          const isChiron = point.key === "chiron";

          return (
            <text
              key={point.key}
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              style={{
                fill: isChiron ? "#C9A96E" : "rgba(255,255,255,0.9)",
                fontSize: isChiron ? "17px" : "14px",
              }}
            >
              {getPointLabel(point)}
            </text>
          );
        })}

        <circle cx={center} cy={center} r={18} className="wheelCore" />

        {fullWidth && (() => {
          const btnY = size - 20;
          const btnW = 210;
          const btnH = 28;
          const handleClick = () => {
            const el = document.getElementById("cta-herida-don");
            if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
          };
          return (
            <g onClick={handleClick} style={{ cursor: "pointer" }}>
              <rect
                x={center - btnW / 2}
                y={btnY - btnH / 2}
                width={btnW}
                height={btnH}
                rx={4}
                ry={4}
                fill="rgba(201,169,110,0.06)"
                stroke="#C9A96E"
                strokeWidth={1}
              />
              <text
                x={center}
                y={btnY}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ fill: "#C9A96E", fontSize: "13px", fontWeight: "600", letterSpacing: "3px", textTransform: "uppercase" }}
              >
                {lang === "en" ? "Chiron revealed" : "Quirón revelado"}
              </text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}