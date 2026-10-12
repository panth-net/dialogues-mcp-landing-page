// Verify content/install-prompts.json.
//
// Usage:
//   npm run check:prompts                      -> validate the local copy's shape
//   npm run check:prompts -- <path-to-source>  -> also require a byte-for-byte
//                                                 match with the given file
//
// Exits non-zero on any mismatch, so it can gate CI or a pre-deploy check.

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validatePrompts } from "./prompts-schema.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const local = path.join(root, "content", "install-prompts.json");

const localBytes = await readFile(local);
let parsed;
try {
  parsed = JSON.parse(localBytes.toString("utf8"));
} catch (error) {
  console.error(`content/install-prompts.json is not valid JSON: ${error.message}`);
  process.exit(1);
}

const problems = validatePrompts(parsed);
if (problems.length > 0) {
  console.error("content/install-prompts.json is missing expected fields:");
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}

const source = process.argv[2];
if (!source) {
  console.log(
    `OK: local copy is valid (version ${parsed.version}). ` +
      "Pass a source path to also compare contents.",
  );
  process.exit(0);
}

const sourceBytes = await readFile(path.resolve(source));
if (Buffer.compare(localBytes, sourceBytes) === 0) {
  console.log("OK: content/install-prompts.json matches the source exactly.");
  process.exit(0);
}

const normalize = (buf) => buf.toString("utf8").replace(/\r\n/g, "\n");
if (normalize(localBytes) === normalize(sourceBytes)) {
  console.error("MISMATCH: files differ only in line endings (CRLF vs LF).");
} else {
  console.error("MISMATCH: content/install-prompts.json differs from the source.");
}
console.error("Fix with: npm run sync:prompts -- <same path>");
process.exit(1);
