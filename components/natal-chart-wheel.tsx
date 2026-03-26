import type { ChartData, ChartPoint, Lang } from "@/types/chart";

type NatalChartWheelProps = {
  chartData: ChartData | null;
  fullWidth?: boolean;
  lang?: Lang;
};

const POINT_ORDER = [
  "sun", "moon", "mercury", "venus", "mars", "jupiter",
  "saturn", "uranus", "neptune", "pluto", "chiron", "mean_node",
];

const POINT_LABELS: Record<string, string> = {
  sun: "☉", moon: "☽", mercury: "☿", venus: "♀", mars: "♂",
  jupiter: "♃", saturn: "♄", uranus: "♅", neptune: "♆",
  pluto: "♇", chiron: "⚷", mean_node: "☊",
};

const ZODIAC_SYMBOLS = ["♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓"];
const ZODIAC_NAMES   = ["Ari","Tau","Gem","Can","Leo","Vir","Lib","Sco","Sag","Cap","Aqu","Pis"];

// Subtle element colors for the zodiac symbol ring
const ELEMENT_COLORS = [
  "rgba(220,70,50,0.11)",   // Aries   — Fire
  "rgba(90,140,70,0.09)",   // Taurus  — Earth
  "rgba(80,140,210,0.09)",  // Gemini  — Air
  "rgba(50,120,180,0.11)",  // Cancer  — Water
  "rgba(220,70,50,0.11)",   // Leo     — Fire
  "rgba(90,140,70,0.09)",   // Virgo   — Earth
  "rgba(80,140,210,0.09)",  // Libra   — Air
  "rgba(50,120,180,0.11)",  // Scorpio — Water
  "rgba(220,70,50,0.11)",   // Sag     — Fire
  "rgba(90,140,70,0.09)",   // Cap     — Earth
  "rgba(80,140,210,0.09)",  // Aquarius — Air
  "rgba(50,120,180,0.11)",  // Pisces  — Water
];

function roundCoord(value: number, decimals = 3) {
  return Number(value.toFixed(decimals));
}

function polarToCartesian(cx: number, cy: number, radius: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: roundCoord(cx + radius * Math.cos(angleRad)),
    y: roundCoord(cy + radius * Math.sin(angleRad)),
  };
}

/**
 * Ecliptic longitude → SVG angle.
 * ASC sits at 9 o'clock (270°). Zodiac advances counter-clockwise.
 */
function lonToAngle(lon: number, asc: number): number {
  return ((270 + asc - lon) % 360 + 360) % 360;
}

/**
 * Draw a donut arc slice from svgStartAngle to svgEndAngle (CCW, endAngle = startAngle − 30°).
 */
function arcDonutSlice(
  cx: number, cy: number,
  rOuter: number, rInner: number,
  svgStartAngle: number, svgEndAngle: number
): string {
  const o1 = polarToCartesian(cx, cy, rOuter, svgStartAngle);
  const o2 = polarToCartesian(cx, cy, rOuter, svgEndAngle);
  const i1 = polarToCartesian(cx, cy, rInner, svgStartAngle);
  const i2 = polarToCartesian(cx, cy, rInner, svgEndAngle);
  return [
    `M ${o1.x} ${o1.y}`,
    `A ${rOuter} ${rOuter} 0 0 0 ${o2.x} ${o2.y}`, // outer arc CCW
    `L ${i2.x} ${i2.y}`,
    `A ${rInner} ${rInner} 0 0 1 ${i1.x} ${i1.y}`, // inner arc CW (return)
    "Z",
  ].join(" ");
}

/** 5-pointed star centered at (cx, cy). */
function starPath(cx: number, cy: number, outerR: number, innerR: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const angle = (i * 36 - 90) * Math.PI / 180;
    const r = i % 2 === 0 ? outerR : innerR;
    pts.push(`${i === 0 ? "M" : "L"}${roundCoord(cx + r * Math.cos(angle))},${roundCoord(cy + r * Math.sin(angle))}`);
  }
  return pts.join(" ") + " Z";
}

function getPointEntries(chartData: ChartData | null) {
  if (!chartData?.points) return [];
  return (Object.values(chartData.points) as ChartPoint[])
    .filter((p): p is ChartPoint => Boolean(p) && typeof p.longitude === "number")
    .sort((a, b) => {
      const ai = POINT_ORDER.indexOf(a.key), bi = POINT_ORDER.indexOf(b.key);
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    });
}

/** Stagger planet radii within the planet ring to reduce overlap. */
function getPlanetRadius(index: number): number {
  const cycle = index % 3;
  if (cycle === 0) return 173;
  if (cycle === 1) return 161;
  return 183;
}

export function NatalChartWheel({ chartData, fullWidth, lang = "es" }: NatalChartWheelProps) {
  const size   = 520;
  const center = 260;

  // ── Ring radii (outside → inside) ──────────────────────────────────────────
  const outerEdge    = 248;  // outermost rim of the wheel
  const signNameInner = 230; // inner edge of sign-name text ring  → names at r≈239
  const zodiacOuter   = 230; // outer edge of zodiac-symbol ring   (= signNameInner)
  const zodiacInner   = 194; // inner edge of zodiac-symbol ring   → symbols at r≈212
  // Planet ring: zodiacInner (194) down to planetInner (148)       → planets at 161-183
  const planetInner  = 148;  // inner wall of planet ring / outer wall of house space
  const houseNumberR = 112;  // radius at which house numbers are placed
  const coreRadius   = 24;   // inner core circle

  const points    = getPointEntries(chartData);
  const houses    = chartData?.houses ?? [];
  const ascendant = chartData?.angles?.ascendant?.longitude ?? null;
  const midheaven = chartData?.angles?.midheaven?.longitude ?? null;
  const asc       = ascendant ?? 0;

  return (
    <div className="natalWheelWrap" style={fullWidth ? { maxWidth: "none" } : undefined}>
      <svg viewBox={`0 0 ${size} ${size}`} className="natalWheel" role="img" aria-label="Natal chart wheel">

        {/* ── Zodiac symbol ring: colored backgrounds ── */}
        {Array.from({ length: 12 }, (_, i) => (
          <path
            key={`zbg-${i}`}
            d={arcDonutSlice(center, center, zodiacOuter, zodiacInner,
              lonToAngle(i * 30, asc), lonToAngle((i + 1) * 30, asc))}
            fill={ELEMENT_COLORS[i]}
          />
        ))}

        {/* ── Ring outlines ── */}
        <circle cx={center} cy={center} r={outerEdge}      className="wheelOuter" />
        <circle cx={center} cy={center} r={signNameInner}  className="wheelRing" />
        <circle cx={center} cy={center} r={zodiacInner}    className="wheelRing" />
        <circle cx={center} cy={center} r={planetInner}    className="wheelInner" />

        {/* ── Zodiac sign dividers — only through the two outer zodiac rings ── */}
        {Array.from({ length: 12 }, (_, i) => {
          const angle = lonToAngle(i * 30, asc);
          const start = polarToCartesian(center, center, zodiacInner, angle);
          const end   = polarToCartesian(center, center, outerEdge, angle);
          return <line key={`zdiv-${i}`} x1={start.x} y1={start.y} x2={end.x} y2={end.y} className="wheelDivider" />;
        })}

        {/* ── Sign names — outermost text ring ── */}
        {Array.from({ length: 12 }, (_, i) => {
          const pos = polarToCartesian(center, center, (signNameInner + outerEdge) / 2, lonToAngle(i * 30 + 15, asc));
          return (
            <text key={`sname-${i}`} x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle" className="wheelSignLabel">
              {ZODIAC_NAMES[i]}
            </text>
          );
        })}

        {/* ── Zodiac Unicode symbols — symbol ring ── */}
        {Array.from({ length: 12 }, (_, i) => {
          const pos = polarToCartesian(center, center, (zodiacOuter + zodiacInner) / 2, lonToAngle(i * 30 + 15, asc));
          return (
            <text key={`zsym-${i}`} x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle" className="wheelZodiacSymbol">
              {ZODIAC_SYMBOLS[i]}
            </text>
          );
        })}

        {/* ── House cusp lines — from core to zodiacInner (cross planet ring so houses are visible) ── */}
        {houses.map((house) => {
          if (typeof house.cuspLongitude !== "number") return null;
          const cuspAngle  = lonToAngle(house.cuspLongitude, asc);
          const start      = polarToCartesian(center, center, coreRadius, cuspAngle);
          const end        = polarToCartesian(center, center, zodiacInner, cuspAngle);
          // House number: 15° into the house from cusp, toward inner circle
          const labelAngle = lonToAngle(house.cuspLongitude + 15, asc);
          const labelPos   = polarToCartesian(center, center, houseNumberR, labelAngle);
          return (
            <g key={`house-${house.number}`}>
              <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} className="houseDivider" />
              <text x={labelPos.x} y={labelPos.y} textAnchor="middle" dominantBaseline="middle" className="houseLabel">
                {house.number}
              </text>
            </g>
          );
        })}

        {/* ── ASC axis ── */}
        {typeof ascendant === "number" && (() => {
          const angle = lonToAngle(ascendant, asc); // always 270
          const start = polarToCartesian(center, center, zodiacInner, angle);
          const end   = polarToCartesian(center, center, outerEdge + 10, angle);
          const label = polarToCartesian(center, center, outerEdge + 24, angle);
          return (
            <g>
              <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} className="ascLine" />
              <text x={label.x} y={label.y} textAnchor="middle" dominantBaseline="middle" className="angleLabel">ASC</text>
            </g>
          );
        })()}

        {/* ── MC axis ── */}
        {typeof midheaven === "number" && (() => {
          const angle = lonToAngle(midheaven, asc);
          const start = polarToCartesian(center, center, zodiacInner, angle);
          const end   = polarToCartesian(center, center, outerEdge + 10, angle);
          const label = polarToCartesian(center, center, outerEdge + 24, angle);
          return (
            <g>
              <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} className="mcLine" />
              <text x={label.x} y={label.y} textAnchor="middle" dominantBaseline="middle" className="angleLabel">MC</text>
            </g>
          );
        })()}

        {/* ── Planets — in the planet ring (zodiacInner 194 → planetInner 148) ── */}
        {points.map((point, index) => {
          const r      = getPlanetRadius(index);
          const pos    = polarToCartesian(center, center, r, lonToAngle(point.longitude ?? 0, asc));
          const isChiron = point.key === "chiron";
          return (
            <text
              key={point.key}
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              style={{
                fill:     isChiron ? "#C9A96E" : "rgba(255,255,255,0.9)",
                fontSize: isChiron ? "17px" : "14px",
              }}
            >
              {POINT_LABELS[point.key] || point.name}
            </text>
          );
        })}

        {/* ── Core circle ── */}
        <circle cx={center} cy={center} r={coreRadius} className="wheelCore" />

        {/* ── 5-pointed star at center ── */}
        <path
          d={starPath(center, center, 17, 7)}
          fill="rgba(201,169,110,0.85)"
          stroke="rgba(201,169,110,0.35)"
          strokeWidth={0.5}
        />

        {/* ── CTA button (fullWidth mode only) ── */}
        {fullWidth && (() => {
          const btnY = size - 20;
          const btnW = 210;
          const btnH = 28;
          return (
            <g
              onClick={() => document.getElementById("cta-herida-don")?.scrollIntoView({ behavior: "smooth", block: "center" })}
              style={{ cursor: "pointer" }}
            >
              <rect x={center - btnW / 2} y={btnY - btnH / 2} width={btnW} height={btnH} rx={4} ry={4}
                fill="rgba(201,169,110,0.06)" stroke="#C9A96E" strokeWidth={1} />
              <text x={center} y={btnY} textAnchor="middle" dominantBaseline="middle"
                style={{ fill: "#C9A96E", fontSize: "13px", fontWeight: "600", letterSpacing: "3px", textTransform: "uppercase" }}>
                {lang === "en" ? "Chiron revealed" : "Quirón revelado"}
              </text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}
