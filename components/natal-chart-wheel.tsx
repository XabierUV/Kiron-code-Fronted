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
  jupiter: "♃", saturn: "♄", uranus: "⛢", neptune: "♆",
  pluto: "♇", chiron: "⚷", mean_node: "☊",
};

const ZODIAC_SYMBOLS = ["♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓"];
const ZODIAC_NAMES   = ["Ari","Tau","Gem","Can","Leo","Vir","Lib","Sco","Sag","Cap","Aqu","Pis"];

const ELEMENT_COLORS = [
  "rgba(220,70,50,0.11)",  // Aries   — Fire
  "rgba(90,140,70,0.09)",  // Taurus  — Earth
  "rgba(80,140,210,0.09)", // Gemini  — Air
  "rgba(50,120,180,0.11)", // Cancer  — Water
  "rgba(220,70,50,0.11)",  // Leo     — Fire
  "rgba(90,140,70,0.09)",  // Virgo   — Earth
  "rgba(80,140,210,0.09)", // Libra   — Air
  "rgba(50,120,180,0.11)", // Scorpio — Water
  "rgba(220,70,50,0.11)",  // Sag     — Fire
  "rgba(90,140,70,0.09)",  // Cap     — Earth
  "rgba(80,140,210,0.09)", // Aquarius — Air
  "rgba(50,120,180,0.11)", // Pisces  — Water
];

// ── Geometry helpers ────────────────────────────────────────────────────────

function roundCoord(v: number, d = 3) { return Number(v.toFixed(d)); }

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: roundCoord(cx + r * Math.cos(rad)), y: roundCoord(cy + r * Math.sin(rad)) };
}

/** Ecliptic longitude → SVG angle. ASC at 270° (9 o'clock). Zodiac CCW. */
function lonToAngle(lon: number, asc: number): number {
  return ((270 + asc - lon) % 360 + 360) % 360;
}

/** Signed angular difference a→b in the range (−180, 180]. */
function angleDiff(a: number, b: number): number {
  let d = ((b - a) % 360 + 360) % 360;
  if (d > 180) d -= 360;
  return d;
}

/** Donut arc slice (CCW: endAngle = startAngle − 30°). */
function arcDonutSlice(
  cx: number, cy: number,
  rOuter: number, rInner: number,
  svgStart: number, svgEnd: number
): string {
  const o1 = polarToCartesian(cx, cy, rOuter, svgStart);
  const o2 = polarToCartesian(cx, cy, rOuter, svgEnd);
  const i1 = polarToCartesian(cx, cy, rInner, svgStart);
  const i2 = polarToCartesian(cx, cy, rInner, svgEnd);
  return `M ${o1.x} ${o1.y} A ${rOuter} ${rOuter} 0 0 0 ${o2.x} ${o2.y} L ${i2.x} ${i2.y} A ${rInner} ${rInner} 0 0 1 ${i1.x} ${i1.y} Z`;
}

/** 5-pointed star path. */
function starPath(cx: number, cy: number, outerR: number, innerR: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const a = (i * 36 - 90) * Math.PI / 180;
    const r = i % 2 === 0 ? outerR : innerR;
    pts.push(`${i === 0 ? "M" : "L"}${roundCoord(cx + r * Math.cos(a))},${roundCoord(cy + r * Math.sin(a))}`);
  }
  return pts.join(" ") + " Z";
}

// ── Planet data helpers ─────────────────────────────────────────────────────

function getPointEntries(chartData: ChartData | null): ChartPoint[] {
  if (!chartData?.points) return [];
  return (Object.values(chartData.points) as ChartPoint[])
    .filter((p): p is ChartPoint => Boolean(p) && typeof p.longitude === "number")
    .sort((a, b) => {
      const ai = POINT_ORDER.indexOf(a.key), bi = POINT_ORDER.indexOf(b.key);
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    });
}

/**
 * Anti-collision: planets start at PLANET_BASE_R (near outer edge of house ring).
 * If two planets are angularly closer than MIN_DEG, the later one is nudged
 * INWARD by STEP_R — never outward. Radius is clamped to [PLANET_MIN_R, PLANET_BASE_R].
 *
 * PLANET_BASE_R must be strictly less than zodiacInner so planets stay in the house ring.
 */
const PLANET_BASE_R = 182; // outer part of house ring, well inside zodiacInner=194
const PLANET_MIN_R  = 155; // innermost allowed planet position (above house numbers)
const PLANET_STEP_R = 14;  // radial nudge per collision
const PLANET_MIN_DEG = 10; // minimum angular separation before nudging

type PlacedPlanet = { key: string; svgAngle: number; radius: number };

function placePlanets(points: ChartPoint[], asc: number): PlacedPlanet[] {
  const placed: PlacedPlanet[] = [];

  for (const point of points) {
    const svgAngle = lonToAngle(point.longitude ?? 0, asc);
    let radius = PLANET_BASE_R;

    // Find the worst angular overlap with already-placed planets at same radius
    let tries = 0;
    while (tries < 6) {
      const conflict = placed.find(
        (p) => p.radius === radius && Math.abs(angleDiff(p.svgAngle, svgAngle)) < PLANET_MIN_DEG
      );
      if (!conflict) break;
      radius = Math.max(PLANET_MIN_R, radius - PLANET_STEP_R);
      tries++;
    }

    placed.push({ key: point.key, svgAngle, radius });
  }

  return placed;
}

// ── Component ───────────────────────────────────────────────────────────────

export function NatalChartWheel({ chartData, fullWidth, lang = "es" }: NatalChartWheelProps) {
  const size   = 520;
  const center = 260;

  // Ring radii (outside → inside)
  const outerEdge     = 248; // outermost rim
  const signNameInner = 230; // inner edge of sign-name text ring  → labels at ~239
  const zodiacOuter   = 230; // outer edge of zodiac-symbol ring   (= signNameInner)
  const zodiacInner   = 194; // inner edge of zodiac-symbol ring   → symbols at ~212
  //
  // ── HOUSE / PLANET RING: zodiacInner (194) → planetInner (138) ──────────
  // Planets placed near outer edge (PLANET_BASE_R=182), nudged inward on collision.
  // House numbers near inner edge at houseNumberR=110.
  const planetInner  = 138; // inner wall of planet+house ring
  const houseNumberR = 110; // where house numbers are placed (innermost of house ring)
  const coreRadius   = 24;  // center core circle

  const points    = getPointEntries(chartData);
  const houses    = chartData?.houses ?? [];
  const ascendant = chartData?.angles?.ascendant?.longitude ?? null;
  const midheaven = chartData?.angles?.midheaven?.longitude ?? null;
  const asc       = ascendant ?? 0;

  const placedPlanets = placePlanets(points, asc);
  const planetMap     = new Map(placedPlanets.map((p) => [p.key, p]));

  return (
    <div className="natalWheelWrap" style={fullWidth ? { maxWidth: "none" } : undefined}>
      <svg viewBox={`0 0 ${size} ${size}`} className="natalWheel" role="img" aria-label="Natal chart wheel">

        {/* ── CAPA 2: Zodiac symbol ring — colored element backgrounds ── */}
        {Array.from({ length: 12 }, (_, i) => (
          <path
            key={`zbg-${i}`}
            d={arcDonutSlice(center, center, zodiacOuter, zodiacInner,
              lonToAngle(i * 30, asc), lonToAngle((i + 1) * 30, asc))}
            fill={ELEMENT_COLORS[i]}
          />
        ))}

        {/* ── Ring outlines ── */}
        <circle cx={center} cy={center} r={outerEdge}     className="wheelOuter" />
        <circle cx={center} cy={center} r={signNameInner} className="wheelRing" />
        <circle cx={center} cy={center} r={zodiacInner}   className="wheelRing" />
        <circle cx={center} cy={center} r={planetInner}   className="wheelInner" />

        {/* ── Zodiac sign dividers — only through the two outer zodiac rings ── */}
        {Array.from({ length: 12 }, (_, i) => {
          const angle = lonToAngle(i * 30, asc);
          const s = polarToCartesian(center, center, zodiacInner, angle);
          const e = polarToCartesian(center, center, outerEdge, angle);
          return <line key={`zdiv-${i}`} x1={s.x} y1={s.y} x2={e.x} y2={e.y} className="wheelDivider" />;
        })}

        {/* ── CAPA 1: Sign name abbreviations — outermost ring ── */}
        {Array.from({ length: 12 }, (_, i) => {
          const pos = polarToCartesian(center, center, (signNameInner + outerEdge) / 2, lonToAngle(i * 30 + 15, asc));
          return (
            <text key={`sname-${i}`} x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle" className="wheelSignLabel">
              {ZODIAC_NAMES[i]}
            </text>
          );
        })}

        {/* ── CAPA 2: Zodiac Unicode symbols — symbol ring ── */}
        {Array.from({ length: 12 }, (_, i) => {
          const pos = polarToCartesian(center, center, (zodiacOuter + zodiacInner) / 2, lonToAngle(i * 30 + 15, asc));
          return (
            <text key={`zsym-${i}`} x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle" className="wheelZodiacSymbol">
              {ZODIAC_SYMBOLS[i]}
            </text>
          );
        })}

        {/* ── House cusp lines — span from coreRadius to zodiacInner ── */}
        {houses.map((house) => {
          if (typeof house.cuspLongitude !== "number") return null;
          const angle = lonToAngle(house.cuspLongitude, asc);
          const s = polarToCartesian(center, center, coreRadius, angle);
          const e = polarToCartesian(center, center, zodiacInner, angle);
          return (
            <line key={`hline-${house.number}`} x1={s.x} y1={s.y} x2={e.x} y2={e.y} className="houseDivider" />
          );
        })}

        {/* ── CAPA 3B: House numbers — innermost part of house ring ── */}
        {houses.map((house, idx) => {
          if (typeof house.cuspLongitude !== "number") return null;
          // Find the next cusp to place the number at the midpoint of the house sector
          const nextHouse = houses[(idx + 1) % houses.length];
          let midLon: number;
          if (typeof nextHouse?.cuspLongitude === "number") {
            const span = ((nextHouse.cuspLongitude - house.cuspLongitude + 360) % 360);
            midLon = house.cuspLongitude + span / 2;
          } else {
            midLon = house.cuspLongitude + 15;
          }
          const labelAngle = lonToAngle(midLon, asc);
          const labelPos   = polarToCartesian(center, center, houseNumberR, labelAngle);
          return (
            <text key={`hnum-${house.number}`} x={labelPos.x} y={labelPos.y} textAnchor="middle" dominantBaseline="middle" className="houseLabel">
              {house.number}
            </text>
          );
        })}

        {/* ── ASC axis ── */}
        {typeof ascendant === "number" && (() => {
          const angle = lonToAngle(ascendant, asc);
          const s = polarToCartesian(center, center, zodiacInner, angle);
          const e = polarToCartesian(center, center, outerEdge + 10, angle);
          const l = polarToCartesian(center, center, outerEdge + 24, angle);
          return (
            <g>
              <line x1={s.x} y1={s.y} x2={e.x} y2={e.y} className="ascLine" />
              <text x={l.x} y={l.y} textAnchor="middle" dominantBaseline="middle" className="angleLabel">ASC</text>
            </g>
          );
        })()}

        {/* ── MC axis ── */}
        {typeof midheaven === "number" && (() => {
          const angle = lonToAngle(midheaven, asc);
          const s = polarToCartesian(center, center, zodiacInner, angle);
          const e = polarToCartesian(center, center, outerEdge + 10, angle);
          const l = polarToCartesian(center, center, outerEdge + 24, angle);
          return (
            <g>
              <line x1={s.x} y1={s.y} x2={e.x} y2={e.y} className="mcLine" />
              <text x={l.x} y={l.y} textAnchor="middle" dominantBaseline="middle" className="angleLabel">MC</text>
            </g>
          );
        })()}

        {/* ── CAPA 3A: Planets — outer part of house ring, anti-collision inward only ── */}
        {points.map((point) => {
          const placed = planetMap.get(point.key);
          if (!placed) return null;
          // Safety clamp: never outside zodiacInner, never inside planetInner
          const r = Math.min(zodiacInner - 12, Math.max(planetInner + 6, placed.radius));
          const pos = polarToCartesian(center, center, r, placed.svgAngle);
          const isChiron = point.key === "chiron";
          return (
            <text
              key={point.key}
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              style={{
                fill:     isChiron ? "#C9A96E" : "rgba(255,255,255,0.92)",
                fontSize: isChiron ? "17px" : "14px",
                fontWeight: isChiron ? "700" : "400",
              }}
            >
              {POINT_LABELS[point.key] || point.name}
            </text>
          );
        })}

        {/* ── Core circle ── */}
        <circle cx={center} cy={center} r={coreRadius} className="wheelCore" />

        {/* ── Centro: 5-pointed star ── */}
        <path
          d={starPath(center, center, 17, 7)}
          fill="rgba(201,169,110,0.85)"
          stroke="rgba(201,169,110,0.35)"
          strokeWidth={0.5}
        />

        {/* ── CTA button (fullWidth mode only) ── */}
        {fullWidth && (() => {
          const btnY = size - 20, btnW = 210, btnH = 28;
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
