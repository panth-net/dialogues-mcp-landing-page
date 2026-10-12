// Build content/collections.json (the "Documents" tab) from the Dialogues
// server's compiled catalog.
//
// Usage: npm run sync:collections -- <path-to-builtin-catalog.json>
//
// The catalog ships in the dialogues-mcp package at dist/builtin-catalog.json
// (e.g. `$(npm root -g)/dialogues-mcp/dist/builtin-catalog.json`). Nothing
// about where it lives is assumed; you always pass the path.

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const target = path.join(root, "content", "collections.json");

// Readable names for the sites the collections download from. Several hosts
// can share one name (all Wikisource languages, say); they are merged.
const SOURCES = {
  "gutenberg.org": ["Project Gutenberg", "https://www.gutenberg.org"],
  "archive.org": ["Internet Archive", "https://archive.org"],
  "loc.gov": ["Library of Congress", "https://www.loc.gov"],
  "eap.bl.uk": ["British Library Endangered Archives", "https://eap.bl.uk"],
  "commons.wikimedia.org": ["Wikimedia Commons", "https://commons.wikimedia.org"],
  "darwinproject.ac.uk": ["Darwin Correspondence Project", "https://www.darwinproject.ac.uk"],
  "rigb.org": ["Royal Institution", "https://www.rigb.org"],
  "atom.aim25.com": ["AIM25 London archives", "https://atom.aim25.com"],
  "gandhiheritageportal.org": ["Gandhi Heritage Portal", "https://www.gandhiheritageportal.org"],
  "lib.uchicago.edu": ["University of Chicago Library", "https://www.lib.uchicago.edu"],
  "primarysourcecoop.org": ["Primary Source Cooperative", "https://www.primarysourcecoop.org"],
  "masshist.org": ["Massachusetts Historical Society", "https://www.masshist.org"],
  "dbnl.org": ["DBNL", "https://www.dbnl.org"],
  "fgh.perseids.org": ["Perseids", "https://fgh.perseids.org"],
  "collection.sciencemuseumgroup.org.uk": [
    "Science Museum Group",
    "https://collection.sciencemuseumgroup.org.uk",
  ],
  "claymath.org": ["Clay Mathematics Institute", "https://www.claymath.org"],
  "geniza.princeton.edu": ["Princeton Geniza Project", "https://geniza.princeton.edu"],
  "es.wikisource.org": ["Wikisource", "https://wikisource.org"],
  "zh.wikisource.org": ["Wikisource", "https://wikisource.org"],
  "ko.wikisource.org": ["Wikisource", "https://wikisource.org"],
  "catalog.hathitrust.org": ["HathiTrust", "https://www.hathitrust.org"],
  "newtonproject.ox.ac.uk": ["The Newton Project", "https://www.newtonproject.ox.ac.uk"],
  "webapp1.dlib.indiana.edu": ["Chymistry of Isaac Newton", "https://webapp1.dlib.indiana.edu/newton"],
  "wellcomecollection.org": ["Wellcome Collection", "https://wellcomecollection.org"],
  "collections.dartmouth.edu": ["Dartmouth Library", "https://collections.dartmouth.edu"],
  "emuseum.nich.go.jp": ["e-Museum, Japan", "https://emuseum.nich.go.jp"],
  "tolstoy.ru": ["State Tolstoy Museum", "https://www.tolstoy.ru"],
  "vangoghletters.org": ["Van Gogh Letters Project", "https://vangoghletters.org"],
  // The Walt Whitman Archive publishes its TEI files on GitHub.
  "raw.githubusercontent.com/whitmanarchive": ["Walt Whitman Archive", "https://whitmanarchive.org"],
  "whitmanarchive.org": ["Walt Whitman Archive", "https://whitmanarchive.org"],
  "unesco.org": ["UNESCO", "https://www.unesco.org"],
  "ctext.org": ["Chinese Text Project", "https://ctext.org"],
  "db.itkc.or.kr": ["Institute for the Translation of Korean Classics", "https://db.itkc.or.kr"],
  "heritage.go.kr": ["Korea Heritage Service", "https://www.heritage.go.kr"],
  "library.ltikorea.or.kr": ["LTI Korea Library", "https://library.ltikorea.or.kr"],
};

function sourceFor(url) {
  const { hostname, pathname } = new URL(url);
  const host = hostname.replace(/^www\./, "");
  const owner = pathname.split("/")[1];
  return SOURCES[`${host}/${owner}`] ?? SOURCES[host] ?? null;
}

const source = process.argv[2];
if (!source) {
  console.error("Usage: npm run sync:collections -- <path-to-builtin-catalog.json>");
  process.exit(2);
}

const catalog = JSON.parse(await readFile(path.resolve(source), "utf8"));
const files = catalog?.files;
if (!files || typeof files !== "object") {
  console.error("Source does not look like builtin-catalog.json (no `files` map).");
  process.exit(1);
}

const unknownHosts = new Set();
const collections = [];

for (const [file, entry] of Object.entries(files)) {
  const match = file.match(/^corpora\/([^/]+)\/corpus\.yaml$/);
  if (!match) continue;
  const corpus = entry.value;
  const manifest = files[`corpora/${match[1]}/source-manifest.yaml`]?.value;
  const items = (manifest?.items ?? []).filter((item) => item.selected !== false && item.url);

  const counts = new Map();
  for (const item of items) {
    const found = sourceFor(item.url);
    if (!found) {
      unknownHosts.add(new URL(item.url).hostname);
      continue;
    }
    const [name, url] = found;
    const current = counts.get(name) ?? { name, url, count: 0 };
    current.count += 1;
    counts.set(name, current);
  }

  collections.push({
    id: corpus.id,
    title: corpus.title,
    downloadable: corpus.downloadable !== false,
    sources: [...counts.values()]
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
      .map(({ name, url }) => ({ name, url })),
  });
}

if (unknownHosts.size > 0) {
  console.error("No readable name for these source hosts; add them to SOURCES:");
  for (const host of unknownHosts) console.error(`  - ${host}`);
  process.exit(1);
}

collections.sort((a, b) => a.title.localeCompare(b.title));
const output = `${JSON.stringify({ version: catalog.version ?? 1, collections }, null, 2)}\n`;

let previous = null;
try {
  previous = await readFile(target, "utf8");
} catch {
  // first sync
}

if (previous === output) {
  console.log("content/collections.json is already up to date.");
} else {
  await writeFile(target, output);
  console.log(`Updated content/collections.json (${collections.length} collections).`);
}
