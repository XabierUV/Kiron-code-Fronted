import tzLookup from "tz-lookup";

export function getTimezoneFromCoords(latitude: number, longitude: number): string {
  return tzLookup(latitude, longitude);
}
