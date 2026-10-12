export const SITE = {
  name: "Dialogues MCP",
  tagline: "Talk with historical diaries and letters, on your computer.",
  description:
    "Dialogues MCP is a free, open-source helper that runs on your computer. Connect your AI app, download a document collection, and ask questions. Answers quote and cite the original diaries and letters.",
  /** Path the site is served under (the GitHub Pages project path); "" at a domain root. */
  basePath: "/dialogues-mcp-landing-page",
  /** Canonical URL of the site (origin plus base path), no trailing slash. */
  domain: "https://panth-net.github.io/dialogues-mcp-landing-page",
  github: "https://github.com/panth-net/dialogues-mcp",
  npmPackage: "dialogues-mcp",
  npmUrl: "https://www.npmjs.com/package/dialogues-mcp",
  publisher: {
    name: "Pantheon Network",
    url: "https://pantheonnetwork.co",
  },
} as const;

export type SiteConfig = typeof SITE;

/** URL of a file in public/, including the base path. */
export function asset(path: string) {
  return `${SITE.basePath}${path}`;
}
