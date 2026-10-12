import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site-config";

// Written once at build time (static export).
export const dynamic = "force-static";

// Fixed date keeps builds reproducible; bump it when page content changes.
const LAST_MODIFIED = "2026-10-08";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE.domain}/`,
      lastModified: LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
