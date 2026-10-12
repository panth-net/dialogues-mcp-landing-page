import type { NextConfig } from "next";
import { SITE } from "./lib/site-config";

// Static export: `next build` writes plain files to out/, which GitHub Pages
// serves under SITE.basePath. Static hosting cannot send custom headers.
const nextConfig: NextConfig = {
  output: "export",
  basePath: SITE.basePath,
  poweredByHeader: false,
};

export default nextConfig;
