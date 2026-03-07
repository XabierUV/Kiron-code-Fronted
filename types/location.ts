export type GeocodeInput = {
  birthCity: string;
  birthCountry: string;
};

export type ResolvedLocation = {
  displayName: string;
  latitude: number;
  longitude: number;
  timezone: string;
};
