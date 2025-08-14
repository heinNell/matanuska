#!/usr/bin/env node
// /workspaces/matrefactor/find-providers-and-contexts.mjs
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// Configuration
const SEARCH_DIR = "src"; // Relative to this script
const OUTPUT_FILE = "react-providers-list.txt";
const FILE_PATTERNS = [
  /Provider\.[jt]sx?$/i, // Matches *Provider.js/jsx/ts/tsx
  /Context\.[jt]sx?$/i, // Matches *Context.js/jsx/ts/tsx
];

// Get script location
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function findReactProviders(dir) {
  const results = [];

  async function scan(currentDir) {
    try {
      const entries = await fs.readdir(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);

        if (entry.isDirectory()) {
          await scan(fullPath);
        } else if (entry.isFile() && FILE_PATTERNS.some((pattern) => pattern.test(entry.name))) {
          results.push({
            file: fullPath,
            type: entry.name.includes("Provider") ? "Provider" : "Context",
          });
        }
      }
    } catch (error) {
      if (error.code !== "ENOENT") {
        console.error(`Error scanning ${currentDir}:`, error.message);
      }
    }
  }

  await scan(dir);
  return results;
}

// Main execution
(async () => {
  const searchPath = path.join(__dirname, SEARCH_DIR);
  console.log(`🔍 Searching in: ${searchPath}`);

  try {
    await fs.access(searchPath);
    const providers = await findReactProviders(searchPath);

    if (providers.length === 0) {
      console.log("❌ No Provider/Context files found. Check:");
      console.log(`1. Your ${SEARCH_DIR} directory exists`);
      console.log("2. Files match *Provider.* or *Context.* patterns");
      process.exit(1);
    }

    // Group results by type
    const grouped = providers.reduce((acc, item) => {
      acc[item.type] = acc[item.type] || [];
      acc[item.type].push(item.file);
      return acc;
    }, {});

    // Format output
    let output = "";
    for (const [type, files] of Object.entries(grouped)) {
      output +=
        `\n${type}s (${files.length}):\n` +
        files.map((f) => `  ${path.relative(__dirname, f)}`).join("\n");
    }

    console.log(`✅ Found React providers:${output}`);

    // Write to file (includes relative paths)
    await fs.writeFile(
      path.join(__dirname, OUTPUT_FILE),
      providers.map((p) => `${p.type}: ${p.file}`).join("\n")
    );
    console.log(`📄 Saved to ${OUTPUT_FILE}`);
  } catch (error) {
    if (error.code === "ENOENT") {
      console.error(`❌ Directory not found: ${searchPath}`);
    } else {
      console.error("❌ Script failed:", error.message);
    }
    process.exit(1);
  }
})();
