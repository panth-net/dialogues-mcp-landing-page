import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site-config";

// Written once at build time (static export).
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE.domain}/sitemap.xml`,
  };
}
