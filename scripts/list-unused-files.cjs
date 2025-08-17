// scripts/list-unused-files.cjs

const fs = require("fs");
const path = require("path");

const list = fs.readFileSync("unused-files.txt", "utf8")
  .split("\n")
  .map(line => line.trim())
  .filter(line => line && !line.startsWith("[") && !line.startsWith("="));

for (const file of list) {
  if (fs.existsSync(file)) {
    console.log("FOUND:", file);
  } else {
    console.log("NOT FOUND:", file);
  }
}
