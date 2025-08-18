// src/utils/requireEnv.ts
export function requireEnv(name: keyof ImportMetaEnv) {
  const v = import.meta.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}
