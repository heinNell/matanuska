import { useEffect, useState } from "react";
import { ErrorCategory, ErrorSeverity, logError } from "./errorHandling";
import { checkMapsServiceHealth } from "./mapsService";
import { getNetworkState } from "./networkDetection";

declare global {
  interface Window {
    google?: { maps: any };
    gm_authFailure?: () => void;
  }
}

/* ───────────────────────────────────────── CONSTANTS ───────────────────────────────────────── */

const SCRIPT_ID = "google-maps-sdk";                // <── single canonical tag
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const MAPS_SERVICE_URL    = import.meta.env.VITE_MAPS_SERVICE_URL;
const CURRENT_DOMAIN      = typeof window !== "undefined" ? window.location.hostname : "";
const hasFallbackOption   = !!GOOGLE_MAPS_API_KEY;

/* ───────────────────────────────────────── STATE ──────────────────────────────────────────── */

let promise: Promise<void> | null = null;           // shared loader promise
let useDirectApi          = false;
let serviceCheckAttempted = false;
let authErrorDetected     = false;
let lastErrorMessage: string | null = null;
let requestedLibraries    = new Set<string>();      // track libs across calls

/* ───────────────────────────────────────── HELPERS ────────────────────────────────────────── */

export const isGoogleMapsAPILoaded = () =>
  !!(window.google && window.google.maps);

const getExistingScript = (): HTMLScriptElement | null =>
  document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;

const removeExistingScript = () => {
  const existing = getExistingScript();
  if (existing) existing.remove();
};

const setupAuthFailureHandler = () => {
  if (typeof window === "undefined" || window.gm_authFailure) return;

  window.gm_authFailure = () => {
    authErrorDetected = true;
    const msg = `Google Maps authentication failed. Domain '${CURRENT_DOMAIN}' isn’t allowed.`;
    lastErrorMessage = msg;

    logError(msg, {
      category: ErrorCategory.AUTHENTICATION,
      severity: ErrorSeverity.ERROR,
      message : msg,
      context : { domain: CURRENT_DOMAIN },
    });

    console.error("[Maps Loader] AUTH ERROR:", msg);
    console.info("[Maps Loader] Add the domain in Google Cloud → Credentials → Allowed referrers");
  };
};

/* ───────────────────────────────────── SERVICE CHECK / VALIDATORS ─────────────────────────── */

export const checkMapsServiceAvailability = async (): Promise<boolean> => {
  if (import.meta.env.DEV) {                         // dev → always direct API
    useDirectApi = true;
    serviceCheckAttempted = true;
    return false;
  }

  if (!MAPS_SERVICE_URL) return false;

  try {
    const ok = await checkMapsServiceHealth(MAPS_SERVICE_URL);
    serviceCheckAttempted = true;
    useDirectApi = !ok && hasFallbackOption;
    return ok;
  } catch {
    serviceCheckAttempted = true;
    useDirectApi = hasFallbackOption;
    return false;
  }
};

export const isValidApiKeyFormat = (key?: string) =>
  !!key && key.length >= 30 && !key.includes(" ");

/* ───────────────────────────────────────── MAIN LOADER ────────────────────────────────────── */

export const loadGoogleMapsScript = async (libraries = "places"): Promise<void> => {
  /* 1. Short-circuit if already loaded ─────────────────────────────────────────────────────── */
  if (isGoogleMapsAPILoaded()) return;

  /* 2. Re-use in-flight promise ───────────────────────────────────────────────────────────── */
  if (promise) return promise;

  /* 3. One-time setup ─────────────────────────────────────────────────────────────────────── */
  setupAuthFailureHandler();

  if (GOOGLE_MAPS_API_KEY && !isValidApiKeyFormat(GOOGLE_MAPS_API_KEY)) {
    const err = new Error("Invalid Google Maps API key format");
    logError(err, { category: ErrorCategory.API, severity: ErrorSeverity.ERROR });
    throw err;
  }

  if (getNetworkState().status === "offline") {
    const err = new Error("Cannot load Google Maps while offline");
    logError(err, { category: ErrorCategory.NETWORK, severity: ErrorSeverity.WARNING });
    throw err;
  }

  if (!serviceCheckAttempted && MAPS_SERVICE_URL) await checkMapsServiceAvailability();

  /* 4. Build (deduped) library list ───────────────────────────────────────────────────────── */
  libraries.split(",").map((s) => s.trim()).forEach((l) => requestedLibraries.add(l));
  const dedupedLibs = Array.from(requestedLibraries).join(",");

  /* 5. Construct URL ──────────────────────────────────────────────────────────────────────── */
  let src: string;
  if (MAPS_SERVICE_URL && !useDirectApi) {
    src = `${MAPS_SERVICE_URL}/maps/api/js?libraries=${dedupedLibs}`;
    console.log("[Maps Loader] ▶ via proxy:", src);
  } else if (GOOGLE_MAPS_API_KEY) {
    src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=${dedupedLibs}`;
    console.log("[Maps Loader] ▶ direct API:", src);
  } else {
    const err = new Error("Maps config error: no API key or proxy available");
    logError(err, { category: ErrorCategory.API, severity: ErrorSeverity.ERROR });
    throw err;
  }

  /* 6. Create (or replace) the script tag ─────────────────────────────────────────────────── */
  removeExistingScript();
  const script = document.createElement("script");
  script.id    = SCRIPT_ID;
  script.src   = src;
  script.async = true;
  script.defer = true;

  /* 7. Build shared promise ───────────────────────────────────────────────────────────────── */
  promise = new Promise<void>((resolve, reject) => {
    script.onload = () => {
      // Slight delay to let auth checks run
      setTimeout(() => {
        if (authErrorDetected) {
          promise = null;
          return reject(new Error(lastErrorMessage || "Google Maps auth failed"));
        }
        if (!isGoogleMapsAPILoaded()) {
          promise = null;
          return reject(new Error("Google Maps API failed to initialise"));
        }
        resolve();
      }, 150);
    };

    script.onerror = (e) => {
      logError(new Error("Failed to load Google Maps script"), {
        category: ErrorCategory.NETWORK,
        severity: ErrorSeverity.ERROR,
      });

      // Attempt one fallback rewrite at most
      if (!useDirectApi && hasFallbackOption && MAPS_SERVICE_URL) {
        console.warn("[Maps Loader] proxy failed – retrying with direct API");
        useDirectApi = true;
        promise = null;
        loadGoogleMapsScript(dedupedLibs).then(resolve).catch(reject);
      } else {
        promise = null;
        reject(e instanceof Error ? e : new Error("Unknown script load error"));
      }
    };
  });

  document.head.appendChild(script);
  return promise;
};

/* ───────────────────────────────────────── REACT HOOK ─────────────────────────────────────── */

export const useLoadGoogleMaps = (libraries = "places") => {
  const [isLoaded, setIsLoaded]   = useState(isGoogleMapsAPILoaded());
  const [isLoading, setLoading]   = useState(!isLoaded);
  const [error, setError]         = useState<Error | null>(null);
  const [errorDetails, setDetail] = useState<{
    isAuthError: boolean; isDomainError: boolean; message: string;
  } | null>(null);

  useEffect(() => {
    if (isGoogleMapsAPILoaded()) { setIsLoaded(true); setLoading(false); return; }
    setLoading(true);

    loadGoogleMapsScript(libraries)
      .then(() => { setIsLoaded(true); setLoading(false); })
      .catch((err) => {
        const msg = err instanceof Error ? err.message : String(err);
        const isAuth = msg.includes("auth") || msg.includes("key");
        const isDom  = msg.includes("domain") || msg.includes("referrer");

        logError(err instanceof Error ? err : new Error(msg), {
          category: isAuth ? ErrorCategory.AUTHENTICATION : ErrorCategory.NETWORK,
          severity: ErrorSeverity.ERROR,
        });

        setError(err instanceof Error ? err : new Error(msg));
        setDetail({ isAuthError: isAuth, isDomainError: isDom, message: msg });
        setLoading(false);
      });
  }, [libraries]);

  return { isLoaded, isLoading, error, errorDetails };
};
