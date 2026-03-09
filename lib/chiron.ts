import sweph from "sweph";

export function calculateChiron(julianDay: number) {
  const result = sweph.calc_ut(julianDay, sweph.SE_CHIRON);

  const longitude = result.longitude;

  const signIndex = Math.floor(longitude / 30);

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
  ];

  const sign = signs[signIndex];

  const degree = longitude % 30;

  return {
    longitude,
    sign,
    degree
  };
}
