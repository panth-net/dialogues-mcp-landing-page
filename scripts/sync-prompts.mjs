// Copy the canonical install-prompts.json into content/install-prompts.json.
//
// Usage: npm run sync:prompts -- <path-to-install-prompts.json>
//
// The source path is required; nothing about where the Dialogues server repo
// lives is assumed. The file is copied byte-for-byte after validation.

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validatePrompts } from "./prompts-schema.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const target = path.join(root, "content", "install-prompts.json");

const source = process.argv[2];
if (!source) {
  console.error("Usage: npm run sync:prompts -- <path-to-install-prompts.json>");
  process.exit(2);
}

const bytes = await readFile(path.resolve(source));
let parsed;
try {
  parsed = JSON.parse(bytes.toString("utf8"));
} catch (error) {
  console.error(`Source is not valid JSON: ${error.message}`);
  process.exit(1);
}

const problems = validatePrompts(parsed);
if (problems.length > 0) {
  console.error("Source does not look like install-prompts.json:");
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}

let previous = null;
try {
  previous = await readFile(target);
} catch {
  // first sync
}

if (previous && Buffer.compare(previous, bytes) === 0) {
  console.log("content/install-prompts.json is already up to date.");
} else {
  await writeFile(target, bytes);
  console.log(`Updated content/install-prompts.json (version ${parsed.version}).`);
  console.log("Review the page, then run: npm run check:prompts -- <same path>");
}
