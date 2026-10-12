// Publishes the static export (out/) to the gh-pages branch, which GitHub Pages
// serves as is. Nothing is built on GitHub.
//   npm run build && npm run deploy
// The branch is replaced with a single commit each time, using this
// repository's git identity and origin remote.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "out");
if (!fs.existsSync(path.join(out, "index.html"))) {
  console.error("out/index.html is missing. Run `npm run build` first.");
  process.exit(1);
}

const git = (args, cwd) => execFileSync("git", args, { cwd, encoding: "utf8" }).trim();
const remote = git(["remote", "get-url", "origin"], root);
const name = git(["config", "user.name"], root);
const email = git(["config", "user.email"], root);

const work = fs.mkdtempSync(path.join(os.tmpdir(), "pages-"));
try {
  fs.cpSync(out, work, { recursive: true });
  // Tells GitHub Pages not to run Jekyll, which would drop the _next/ folder.
  fs.writeFileSync(path.join(work, ".nojekyll"), "");
  git(["init", "-q"], work);
  git(["checkout", "-q", "-b", "gh-pages"], work);
  git(["add", "-A"], work);
  git(["-c", `user.name=${name}`, "-c", `user.email=${email}`, "commit", "-q", "-m", "Deploy"], work);
  git(["push", "-q", "--force", remote, "gh-pages"], work);
  console.log(`Pushed out/ to gh-pages on ${remote} as ${name}.`);
} finally {
  fs.rmSync(work, { recursive: true, force: true });
}
