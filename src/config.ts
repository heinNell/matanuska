export const CONFIG = {
  WIALON_URL: "https://hst-api.wialon.com",
  // ⚠️ Gebruik slegs vir interne toets. Vir produksie: doen token->session server-side
  WIALON_TOKEN: "REPLACE_WITH_YOUR_WIALON_TOKEN",
  GOOGLE_MAPS_API_KEY: "REPLACE_WITH_YOUR_GOOGLE_MAPS_API_KEY",
  UPDATE_MS: 30_000, // 30s polling vir "real-time"
  DEFAULT_CENTER: { lat: -26.2041, lng: 28.0473 }, // Johannesburg
} as const;
