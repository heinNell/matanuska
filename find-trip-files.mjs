#!/usr/bin/env node
// find-trip-files.mjs - ES Module version
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// Config
const SEARCH_DIR = process.cwd(); // Start from current directory
const KEYWORD = "trips"; // Case-insensitive match

// Convert import.meta.url to __dirname equivalent
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function findTripFiles(dir, keyword = KEYWORD) {
  const results = [];

  async function scan(currentDir) {
    try {
      const entries = await fs.readdir(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);

        if (entry.isDirectory()) {
          await scan(fullPath); // Recurse into subdirectories
        } else if (entry.isFile() && entry.name.toLowerCase().includes(keyword.toLowerCase())) {
          results.push(fullPath);
        }
      }
    } catch (error) {
      if (error.code !== "ENOENT") {
        // Ignore "no such file" errors
        console.error(`Error scanning ${currentDir}:`, error.message);
      }
    }
  }

  await scan(dir);
  return results;
}

// Main execution
(async () => {
  try {
    console.log(`🔍 Searching for files containing "${KEYWORD}" in ${SEARCH_DIR}...`);

    const tripFiles = await findTripFiles(SEARCH_DIR);

    if (tripFiles.length === 0) {
      console.log("❌ No matching files found");
      process.exit(0);
    }

    console.log(
      `✅ Found ${tripFiles.length} files:\n` +
        tripFiles.map((f) => `• ${path.relative(SEARCH_DIR, f)}`).join("\n")
    );

    // Optional: Save to file
    await fs.writeFile(path.join(__dirname, "trip-files-list.txt"), tripFiles.join("\n"));
    console.log("\n📄 Saved results to trip-files-list.txt");
  } catch (error) {
    console.error("❌ Script failed:", error.message);
    process.exit(1);
  }
})();
