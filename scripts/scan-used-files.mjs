// scripts/scan-used-files.mjs
import esbuild from "esbuild";
import { globSync } from "glob";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

// Entry points for Next.js (app router) + fallbacks
const entries = [
  ...globSync("src/app/**/{page,layout}.{ts,tsx}", { cwd: root, nodir: true }),
  ...globSync("src/pages/**/_app.{ts,tsx}", { cwd: root, nodir: true }),
  ...globSync("src/pages/**/index.{ts,tsx}", { cwd: root, nodir: true }),
  ...globSync("src/main.{ts,tsx}", { cwd: root, nodir: true }),
  ...globSync("src/index.{ts,tsx}", { cwd: root, nodir: true }),
].filter(Boolean);

// If nothing matched (custom structure), fall back to App.tsx
if (entries.length === 0 && fs.existsSync(path.join(root, "src", "App.tsx"))) {
  entries.push("src/App.tsx");
}

if (entries.length === 0) {
  console.error("No entry points found. Update scripts/scan-used-files.mjs to include your roots.");
  process.exit(1);
}

const result = await esbuild.build({
  entryPoints: entries,
  bundle: true,
  metafile: true,
  write: false, // don’t output any files
  absWorkingDir: root,
  platform: "browser",
  format: "esm",
  logLevel: "silent",
  external: ["next", "next/*", "react", "react-dom", "firebase/*"],
  loader: {
    ".css": "empty",
    ".scss": "empty",
    ".svg": "file",
    ".png": "file",
    ".jpg": "file",
    ".jpeg": "file",
    ".gif": "file",
    ".webp": "file",
  },
});

const inputs = result.metafile?.inputs ?? {};
const srcRoot = path.resolve(root, "src") + path.sep;

const files = Object.keys(inputs)
  .map((p) => path.resolve(root, p))
  .filter((abs) => abs.startsWith(srcRoot));

const payload = {
  generatedAt: new Date().toISOString(),
  entries,
  files,
};

fs.writeFileSync(path.join(root, ".used-files.json"), JSON.stringify(payload, null, 2), "utf8");

console.log(`✔ Wrote .used-files.json with ${files.length} used files`);
