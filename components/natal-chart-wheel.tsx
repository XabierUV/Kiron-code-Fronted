import type { ChartData, ChartPoint } from "@/types/chart";

type NatalChartWheelProps = {
  chartData: ChartData | null;
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
  sun: "Sun",
  moon: "Moon",
  mercury: "Mer",
  venus: "Ven",
  mars: "Mars",
  jupiter: "Jup",
  saturn: "Sat",
  uranus: "Ura",
  neptune: "Nep",
  pluto: "Plu",
  chiron: "Chi",
  mean_node: "Node",
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
  if (cycle === 0) return 168;
  if (cycle === 1) return 156;
  return 180;
}

export function NatalChartWheel({ chartData }: NatalChartWheelProps) {
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
    <div className="natalWheelWrap">
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

        {/* Planets – converted from ecliptic longitude to SVG angle */}
        {points.map((point, index) => {
          const pointRadius = getStackedPointRadius(index);
          const pos = polarToCartesian(
            center,
            center,
            pointRadius,
            lonToAngle(point.longitude ?? 0, asc)
          );

          return (
            <g key={point.key}>
              <circle cx={pos.x} cy={pos.y} r={7} className="pointDot" />
              <text
                x={pos.x}
                y={roundCoord(pos.y - 14)}
                textAnchor="middle"
                className="pointLabel"
              >
                {getPointLabel(point)}
              </text>
            </g>
          );
        })}

        <circle cx={center} cy={center} r={18} className="wheelCore" />
      </svg>
    </div>
  );
}