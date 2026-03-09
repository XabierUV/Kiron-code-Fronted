import sweph from "sweph";

export function calculateChiron(julianDay: number) {
  const swephAny = sweph as any;
  const chironId = swephAny.SE_CHIRON;

  if (typeof chironId !== "number") {
    throw new Error("SE_CHIRON is not available in the sweph package.");
  }

  const result: any = swephAny.calc_ut(julianDay, chironId, 0);

  const longitude =
    typeof result?.longitude === "number"
      ? result.longitude
      : Array.isArray(result?.data)
      ? result.data[0]
      : undefined;

  if (!Number.isFinite(longitude)) {
    throw new Error("Could not calculate Chiron longitude.");
  }

  const signs = [
    "Aries",
    "Taurus",
    "Gemini",
    "Cancer",
    "Leo",
    "Virgo",
    "Libra",
    "Scorpio",
    "Sagittarius",
    "Capricorn",
    "Aquarius",
    "Pisces"
  ] as const;

  const signIndex = Math.floor(longitude / 30);
  const sign = signs[signIndex];
  const degree = longitude % 30;

  return {
    longitude,
    sign,
    degree
  };
}
