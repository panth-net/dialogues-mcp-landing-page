# Dialogues MCP landing page

**Live site:** https://panth-net.github.io/dialogues-mcp-landing-page/

The one-page website for **Dialogues MCP**, a free, open-source helper that runs on
your computer and lets an AI app (Claude, Codex, Cursor, VS Code, Antigravity) have guided
conversations with historical diaries and letters. The page explains what
Dialogues MCP is, shows the setup prompt to paste into an AI app, and shows the first
message to send afterwards.

- Next.js (App Router), React, TypeScript, Tailwind CSS 4
- Fully static: no API routes, forms, accounts, cookies, analytics, or
  third-party scripts. Fonts (Open Sans via `next/font/google`, downloaded at
  build time; Geist Mono via the `geist` package) and images are self-hosted, so
  the page makes no requests to other sites.

## Commands

Requires Node.js 20.9 or newer (Node 24 recommended).

```bash
npm install
npm run dev          # local dev server at http://localhost:3000/dialogues-mcp-landing-page
npm run lint
npm run typecheck    # next typegen + tsc --noEmit
npm run build        # static export to out/ (plain HTML, CSS, JS, and images)
npm run deploy       # publish out/ to the gh-pages branch
```

## Hosting

The site is served by GitHub Pages at
https://panth-net.github.io/dialogues-mcp-landing-page/ from the `gh-pages`
branch. No GitHub Actions workflow builds it: `npm run build` writes the site
to `out/` locally, and `npm run deploy` replaces the `gh-pages` branch with
that folder in a single commit. Pages paths include the repository name, so
`basePath` in `lib/site-config.ts` is `/dialogues-mcp-landing-page`; set it to
`""` if the site moves to its own domain.

To skip Next.js's anonymous build telemetry on your machine, set
`NEXT_TELEMETRY_DISABLED=1` (this affects only the build tooling, not the site).

## Site settings

`lib/site-config.ts` holds the site identity: name, tagline, site URL and base
path, GitHub URL (used by the GitHub icon in the header), npm package, and the
publisher credited in the footer.

## Syncing the prompt

`content/install-prompts.json` is a verbatim copy of `resources/install-prompts.json`
from the Dialogues server repo. The page reads the setup prompt, first message,
supported apps, and minimum Node version from it. Never edit the copy by hand.

```bash
# copy the canonical file in (path to your checkout of the server repo)
npm run sync:prompts -- <path-to-dialogues-mcp>/resources/install-prompts.json

# verify the local copy is valid
npm run check:prompts

# verify it matches the canonical file byte for byte (non-zero exit if not)
npm run check:prompts -- <path-to-dialogues-mcp>/resources/install-prompts.json
```

Neither script assumes where the server repo lives; you always pass the path.
Run the byte-for-byte check before each deploy.

## Syncing the collections

`content/collections.json` feeds the "Documents" tab: each collection's title
and the archives its texts download from. It is generated from the catalog that
ships in the `dialogues-mcp` package (`dist/builtin-catalog.json`). Don't edit
it by hand.

```bash
npm run sync:collections -- <path-to-dialogues-mcp>/dist/builtin-catalog.json

# with the package installed globally:
npm run sync:collections -- "$(npm root -g)/dialogues-mcp/dist/builtin-catalog.json"
```

Readable archive names come from the `SOURCES` map in
`scripts/sync-collections.mjs`. If a collection adds a site that isn't in the
map, the script stops and lists the host to add.

## Images

Generated files are committed; nothing is generated at request time. To
regenerate after changing the painting or the logo geometry in `lib/logo.mjs`:

```bash
npm run images
```

`scripts/prepare-images.mjs` (uses `sharp`, a dev dependency) writes:

- `public/og-image.jpg`: 1200x630 crop of the painting with the title, for
  OpenGraph and Twitter cards
- `public/backgroundImages/discussion.webp`: compressed page background (the
  original PNG stays as a fallback)
- `public/icon.svg` and `public/favicon.ico`: the striped-circle logo with no
  background (dark stripes; the SVG turns them white in dark mode)
- `public/apple-touch-icon.png`, `android-chrome-*.png`: white stripes on the
  page color, since home-screen icons need a background

## Accessibility notes

- The painting sits under an even 62% black overlay. Measured over the
  brightest 1% of the painting behind the hero text, body text stays above
  5:1. The passing light waves brighten the background briefly while they
  cross.
- Copy buttons report success or failure through an `aria-live` region and
  change their label. If copying fails, the text is selected so it can be
  copied by hand, and a visible hint explains how. The prompt text is always
  selectable.
- "Documents" and "More info" follow the ARIA tabs pattern: arrow keys,
  Home and End move between tabs, and the hidden panel is `inert`.
- Focus outlines are visible on every control. Reduced-motion preferences turn
  off most transitions; the GitHub button's hover ripple, the copy buttons'
  hover gradient, the tab underline and panel fade, and the background light
  waves keep running.
- At 1440x900 and 1280x800 the page fits one screen. Phones, browser zoom
  (200%, 400%), and larger text sizes scroll normally.

## Rights

- **Code:** MIT, see `LICENSE`. The license covers code only.
- **Historical texts:** the document collections are not part of this repo.
  Each keeps its own terms.
- **Artwork:** the painting (`public/backgroundImages/discussion.png`) and the
  OpenGraph image derived from it (`public/og-image.jpg`) were made for
  Dialogues MCP. They are not covered by the MIT license; all rights reserved.
