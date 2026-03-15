export type Lang = "es" | "en";

export type ChartRequest = {
  name: string;
  birthDate: string;
  birthTime: string;
  birthCity: string;
  birthCountry: string;
};

export type LocationData = {
  displayName: string;
  latitude: number;
  longitude: number;
  timezone?: string;
};

export type SimpleChironData = {
  sign: string;
  degree: number;
  house: number;
};

export type ChartMeta = {
  provider: string;
  zodiac: string;
  houseSystem: string;
  ayanamsha: string | null;
  coordinateSystem: string;
};

export type ChartPoint = {
  key: string;
  name: string;
  longitude: number | null;
  latitude: number | null;
  speed: number | null;
  sign: string | null;
  degreeInSign: number | null;
  house: number | null;
  retrograde: boolean;
};

export type ChartAngle = {
  key: string;
  name: string;
  longitude: number | null;
  sign: string | null;
  degreeInSign: number | null;
};

export type ChartHouse = {
  number: number;
  cuspLongitude: number | null;
  sign: string | null;
  degreeInSign: number | null;
};

export type ChartAspect = {
  pointA: string;
  pointB: string;
  type: string;
  angle: number | null;
  orb: number | null;
  applying: boolean | null;
};

export type ChartCalculation = {
  julianDay: number;
  latitude: number;
  longitude: number;
};

export type ChartData = {
  meta?: ChartMeta;
  points?: Record<string, ChartPoint | null>;
  angles?: Record<string, ChartAngle | null>;
  houses?: ChartHouse[];
  aspects?: ChartAspect[];
  calculation?: ChartCalculation | null;
  chiron: SimpleChironData;
};

export type PreviewData = {
  strengths: string;
  challenges: string;
  patterns: string;
};

export type ChartResponse = {
  ok: boolean;
  provider?: string;
  chartId?: string;
  reportId?: string;
  location?: LocationData;
  chart?: ChartData;
  preview?: PreviewData;
  error?: string;
};

export type ReportSection = {
  title: string;
  text: string;
};

export type PremiumReport = {
  createdAt: string;
  sections: ReportSection[];
};

export type ReportRecordResponse = {
  ok: boolean;
  report?: {
    id: string;
    chartId: string;
    reportType: string;
    status: string;
    reportJson: PremiumReport | null;
    pdfUrl: string | null;
    createdAt: string;
    deliveredAt: string | null;
  };
  error?: string;
};