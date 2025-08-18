// src/utils/wialonInit.ts

// NOTE:
// Do NOT redeclare window.wialon or window.W here — they are already
// declared in src/types/wialon-sdk.d.ts. Re-declaring causes TS2687/2717.

export interface WialonInitOptions {
  apiUrl?: string; // defaults to import.meta.env.VITE_WIALON_API_URL
  token?: string;  // defaults to import.meta.env.VITE_WIALON_SESSION_TOKEN
}

let session: any | null = null;
let initialized = false;

function getSdk(): any {
  const w = window as any;
  return w?.wialon || w?.W;
}

async function waitForSdk(timeoutMs = 8000): Promise<any> {
  const start = Date.now();
  while (true) {
    const sdk = getSdk();
    if (sdk?.core?.Session) return sdk;
    if (Date.now() - start > timeoutMs) {
      // Enhanced diagnostic
      console.error(
        "[WialonInit] Wialon SDK script not loaded after %d ms. " +
        "Check that %c<script src=\"%VITE_WIALON_API_URL%/wsdk/script/wialon.js\">%c " +
        "is present in your index.html, and that VITE_WIALON_API_URL is correct and reachable.",
        timeoutMs,
        "color: orange; font-weight: bold;",
        "color: inherit;"
      );
      throw new Error("Wialon SDK script not loaded");
    }
    await new Promise((r) => setTimeout(r, 100));
  }
}

/**
 * Initialize a Wialon session once and reuse it.
 * Ensure index.html loads the SDK exactly once, e.g.:
 *   <script src="%VITE_WIALON_API_URL%/wsdk/script/wialon.js" defer></script>
 */
export async function initWialonSession(
  opts: WialonInitOptions = {}
): Promise<any> {
  if (initialized && session) return session;

  const sdk = await waitForSdk();

  const apiUrl = opts.apiUrl ?? import.meta.env.VITE_WIALON_API_URL;
  const token  = opts.token  ?? import.meta.env.VITE_WIALON_SESSION_TOKEN;

  if (!apiUrl) throw new Error("Missing VITE_WIALON_API_URL");
  if (!token)  throw new Error("Missing VITE_WIALON_SESSION_TOKEN");

  const sess = sdk.core.Session.getInstance();
  sess.initSession(apiUrl);

  // Add clear console debug for what will be attempted
  console.debug("[WialonInit] Attempting Wialon login", {
    apiUrl,
    token: token.slice(0, 6) + "…" + token.slice(-4), // redact for logs
  });

  await new Promise<void>((resolve, reject) => {
    sess.loginToken(token, "", (code: number) => {
      if (code) {
        // Enhanced error: link to doc, list common issues
        const msg =
          `Wialon login failed (code ${code})\n` +
          `• Error code 5 = authentication failed (token expired, invalid, or revoked)\n` +
          `• Check your .env and Netlify/CI secrets for VITE_WIALON_SESSION_TOKEN\n` +
          `• Double-check the token has NOT expired and has correct access scope\n` +
          `• See Wialon error code docs: https://sdk.wialon.com/wiki/en/sidebar/remoteapi/errors\n`;
        // Log to console
        console.error("[WialonInit] %s", msg, { apiUrl });
        reject(new Error(msg));
      } else {
        console.info("[WialonInit] Wialon session established successfully");
        resolve();
      }
    });
  });

  session = sess;
  initialized = true;
  return session;
}

export function getWialonSession(): any {
  if (!session) {
    throw new Error("Wialon not initialized. Call initWialonSession() first.");
  }
  return session;
}

export async function logoutWialon(): Promise<void> {
  if (!session) return;
  await new Promise<void>((resolve) => session.logout(() => resolve()));
  session = null;
  initialized = false;
}
