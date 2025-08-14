// src/utils/wialonAuth.ts
export async function loadWialonSDK() {
  return new Promise<void>((resolve, reject) => {
    if (window.wialon) return resolve();
    const script = document.createElement("script");
    script.src = "https://hst-api.wialon.com/wsdk/script/wialon.js";
    script.onload = () => resolve();
    script.onerror = () => reject("Failed to load Wialon SDK");
    document.head.appendChild(script);
  });
}

export async function loginWialon(token: string) {
  return new Promise<string>((resolve, reject) => {
    const session = window.wialon.core.Session.getInstance();
    session.initSession("https://hst-api.wialon.com");
    session.loginToken(token, "", (code: number) => {
      if (code) reject(`Login error: ${code}`);
      else resolve("Login successful");
    });
  });
}

export async function logoutWialon() {
  return new Promise<string>((resolve) => {
    const session = window.wialon.core.Session.getInstance();
    session.logout(); // Fixed: no arguments
    resolve("Logged out successfully");
  });
}

export function getCurrentWialonUser() {
  const session = window.wialon.core.Session.getInstance() as any;
  const user = session.getCurrUser?.() || session.getCurrentUser?.();
  return user ? user.getName() : null;
}
