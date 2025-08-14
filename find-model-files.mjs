#!/usr/bin/env node
// find-model-files.mjs
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// Configuration
const SEARCH_TERMS = ["model", "modal", "models"]; // Case-insensitive matches
const SRC_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "../src");

async function findFiles() {
  const results = [];

  async function scan(currentDir) {
    try {
      const entries = await fs.readdir(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);

        if (entry.isDirectory()) {
          await scan(fullPath); // Recurse into all directories
        } else if (
          entry.isFile() &&
          SEARCH_TERMS.some((term) => entry.name.toLowerCase().includes(term.toLowerCase()))
        ) {
          results.push(fullPath);
        }
      }
    } catch (error) {
      if (error.code !== "ENOENT") {
        console.error(`Error scanning ${currentDir}:`, error.message);
      }
    }
  }

  await scan(SRC_DIR);
  return results;
}

// Main execution
(async () => {
  try {
    console.log(`🔍 Searching for files with 'model', 'modal', or 'models' in ${SRC_DIR}...`);

    const files = await findFiles();

    if (files.length === 0) {
      console.log("❌ No matching files found");
      process.exit(0);
    }

    console.log(
      `✅ Found ${files.length} files:\n` +
        files.map((f) => `• ${path.relative(SRC_DIR, f)}`).join("\n")
    );
  } catch (error) {
    console.error("❌ Script failed:", error.message);
    process.exit(1);
  }
})();
