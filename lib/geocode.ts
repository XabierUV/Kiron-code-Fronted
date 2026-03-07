import { GeocodeInput, ResolvedLocation } from "@/types/location";
import { getTimezoneFromCoords } from "@/lib/timezone";

type NominatimResult = {
  display_name: string;
  lat: string;
  lon: string;
};

function normalizeText(value: string): string {
  return value.trim();
}

export async function resolveBirthLocation(
  input: GeocodeInput
): Promise<ResolvedLocation> {
  const birthCity = normalizeText(input.birthCity);
  const birthCountry = normalizeText(input.birthCountry);

  if (!birthCity || !birthCountry) {
    throw new Error("City and country are required.");
  }

  const query = `${birthCity}, ${birthCountry}`;

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "1");

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Accept": "application/json",
      "User-Agent": "KironCode/1.0"
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Geocoding request failed with status ${response.status}.`);
  }

  const results = (await response.json()) as NominatimResult[];

  if (!Array.isArray(results) || results.length === 0) {
    throw new Error("No location found for the provided city and country.");
  }

  const best = results[0];
  const latitude = Number(best.lat);
  const longitude = Number(best.lon);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new Error("Invalid coordinates returned by geocoding service.");
  }

  const timezone = getTimezoneFromCoords(latitude, longitude);

  return {
    displayName: best.display_name,
    latitude,
    longitude,
    timezone
  };
}
