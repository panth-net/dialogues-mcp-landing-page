import type { MetadataRoute } from "next";
import { SITE, asset } from "@/lib/site-config";

// Written once at build time (static export).
export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.name,
    short_name: SITE.name,
    description: SITE.tagline,
    start_url: `${SITE.basePath}/`,
    display: "standalone",
    background_color: "#0b0c10",
    theme_color: "#0b0c10",
    icons: [
      { src: asset("/android-chrome-192x192.png"), sizes: "192x192", type: "image/png" },
      { src: asset("/android-chrome-512x512.png"), sizes: "512x512", type: "image/png" },
      { src: asset("/icon.svg"), sizes: "any", type: "image/svg+xml" },
    ],
  };
}
