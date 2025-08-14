/**
 * Wialon Configuration
 *
 * This file provides centralized access to Wialon API configuration
 * including API URLs, login URLs, and session token management.
 */
import { getEnvVar } from "./envUtils";

// Base API URL for Wialon requests
export const WIALON_API_URL = getEnvVar(
  "VITE_WIALON_API_URL",
  "https://hosting.wialon.com/?token=c1099bc37c906fd0832d8e783b60ae0dD9D1A721B2944486AC08F8AA3ACAC2D2FD45FF053&lang=en"
);

// Direct login URL with token for Wialon hosting
export const WIALON_LOGIN_URL = getEnvVar(
  "VITE_WIALON_LOGIN_URL",
  "https://hosting.wialon.com/?token=c1099bc37c906fd0832d8e783b60ae0dD9D1A721B2944486AC08F8AA3ACAC2D2FD45FF053&lang=en"
);

// Session token for API authentication
export const WIALON_SESSION_TOKEN = getEnvVar("VITE_WIALON_SESSION_TOKEN", "");

// SDK URL for loading the Wialon JavaScript SDK
export const WIALON_SDK_URL =
  "https://hosting.wialon.com/?token=c1099bc37c906fd0832d8e783b60ae0dD9D1A721B2944486AC08F8AA3ACAC2D2FD45FF053&lang=en/wsdk/script/wialon.js";

// Helper function to get the Wialon login URL with a specific token
export const getWialonLoginUrlWithToken = (token: string): string => {
  if (!token) {
    return WIALON_LOGIN_URL; // Use default URL with embedded token
  }

  // Extract base URL without token
  const baseUrl = "https://hosting.wialon.com/";
  return `${baseUrl}?token=${token}&lang=en`;
};

// Helper to open Wialon login in a new tab
export const openWialonLogin = (token?: string): void => {
  const url = token ? getWialonLoginUrlWithToken(token) : WIALON_LOGIN_URL;
  window.open(url, "_blank", "noopener,noreferrer");
};
