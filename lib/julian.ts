export function toJulianDay(date: Date) {
  return date.getTime() / 86400000 + 2440587.5;
}
