#!/usr/bin/env node
// /workspaces/matrefactor/find-context-files.test.mjs
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// Configuration
const SEARCH_DIR = "src"; // Relative to this script's location
const OUTPUT_FILE = "context-providers-list.txt";

// Convert import.meta.url to filesystem path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function findContextFiles(dir) {
  const results = [];

  async function scan(currentDir) {
    try {
      const entries = await fs.readdir(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);

        if (entry.isDirectory()) {
          await scan(fullPath);
        } else if (entry.isFile() && /Context\.[jt]sx?$/i.test(entry.name)) {
          results.push(fullPath);
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
  console.log(`🔍 Searching for Context providers in: ${searchPath}`);

  try {
    // Verify src exists
    await fs.access(searchPath);

    const contextFiles = await findContextFiles(searchPath);

    if (contextFiles.length === 0) {
      console.log("❌ No Context files found. Check:");
      console.log(`1. Your ${SEARCH_DIR} directory exists`);
      console.log(`2. Files match pattern *Context.{js,jsx,ts,tsx}`);
      process.exit(1);
    }

    console.log(`✅ Found ${contextFiles.length} Context providers:`);
    console.log(contextFiles.map((f) => path.relative(__dirname, f)).join("\n"));

    await fs.writeFile(path.join(__dirname, OUTPUT_FILE), contextFiles.join("\n"));
    console.log(`📄 Saved to ${OUTPUT_FILE}`);
  } catch (error) {
    if (error.code === "ENOENT") {
      console.error(`❌ Directory not found: ${searchPath}`);
      console.error("Ensure your project has a src/ directory");
    } else {
      console.error("❌ Script failed:", error.message);
    }
    process.exit(1);
  }
})();
