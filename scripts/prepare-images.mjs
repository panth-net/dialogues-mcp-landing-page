// Build-prep step: generates static image files from committed sources.
// Run with `npm run images` and commit the outputs. Nothing here runs at
// request time; the site serves only the files this script writes.
//
// Inputs:
//   public/backgroundImages/discussion.png  (painting background)
//   lib/logo.mjs                            (logo geometry)
// Outputs:
//   public/og-image.jpg                     (1200x630 OpenGraph/Twitter image)
//   public/backgroundImages/discussion.webp
//   public/icon.svg                         (favicon: no background; dark stripes, white in dark mode)
//   public/favicon.ico                      (single 32x32 PNG-in-ICO, no background)
//   public/apple-touch-icon.png, public/android-chrome-{192,512}.png
//                                           (white stripes on the page color)

import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { COARSE_STRIPES, FINE_STRIPES, stripePath } from "../lib/logo.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pub = (...parts) => path.join(root, "public", ...parts);

async function ogImage() {
  const width = 1200;
  const height = 630;
  // Darken the lower-left so the title stays readable; keep the painting visible.
  const overlay = Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#0b0c10" stop-opacity="0.15"/>
          <stop offset="0.55" stop-color="#0b0c10" stop-opacity="0.45"/>
          <stop offset="1" stop-color="#0b0c10" stop-opacity="0.85"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#g)"/>
      <text x="64" y="520" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="88" font-weight="700" fill="#ffffff">Dialogues MCP</text>
      <text x="66" y="574" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="32" fill="#f1ece2">Talk with historical diaries and letters, on your computer.</text>
    </svg>`);

  await sharp(pub("backgroundImages", "discussion.png"))
    .resize(width, height, { fit: "cover", position: "centre" })
    .composite([{ input: overlay }])
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(pub("og-image.jpg"));
}

async function backgrounds() {
  await sharp(pub("backgroundImages", "discussion.png"))
    .resize({ width: 1800, withoutEnlargement: true })
    .webp({ quality: 70 })
    .toFile(pub("backgroundImages", "discussion.webp"));
}

function pngToIco(png, size) {
  // ICO container holding one PNG image (supported by all current browsers).
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // image count
  const entry = Buffer.alloc(16);
  entry.writeUInt8(size >= 256 ? 0 : size, 0);
  entry.writeUInt8(size >= 256 ? 0 : size, 1);
  entry.writeUInt8(0, 2); // palette
  entry.writeUInt8(0, 3); // reserved
  entry.writeUInt16LE(1, 4); // color planes
  entry.writeUInt16LE(32, 6); // bits per pixel
  entry.writeUInt32LE(png.length, 8);
  entry.writeUInt32LE(6 + 16, 12);
  return Buffer.concat([header, entry, png]);
}

const PAGE = "#0b0c10";

function logoSvg({ count, stroke, size, background, padding = 0, css = "" }) {
  const { d, width } = stripePath(count);
  const box = 100 + 2 * padding;
  const dims = size ? ` width="${size}" height="${size}"` : "";
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-padding} ${-padding} ${box} ${box}"${dims}>` +
    (css ? `<style>${css}</style>` : "") +
    (background ? `<rect x="${-padding}" y="${-padding}" width="${box}" height="${box}" fill="${background}"/>` : "") +
    `<clipPath id="c"><circle cx="50" cy="50" r="50"/></clipPath>` +
    `<path clip-path="url(#c)" d="${d}" stroke="${stroke}" stroke-width="${width}" fill="none"/>` +
    `</svg>\n`
  );
}

async function icons() {
  // Favicons have no background, so the stripes must show on light and dark tab bars.
  await writeFile(
    pub("icon.svg"),
    logoSvg({ count: COARSE_STRIPES, stroke: PAGE, css: "@media (prefers-color-scheme: dark){path{stroke:#fff}}" }),
  );
  const png32 = await sharp(Buffer.from(logoSvg({ count: COARSE_STRIPES, stroke: PAGE, size: 32 })))
    .png({ compressionLevel: 9 })
    .toBuffer();
  await writeFile(pub("favicon.ico"), pngToIco(png32, 32));

  // Home-screen icons need a background: iOS fills transparent areas with black.
  const appIcon = (size) =>
    sharp(Buffer.from(logoSvg({ count: FINE_STRIPES, stroke: "#ffffff", size, background: PAGE, padding: 28 })))
      .png({ compressionLevel: 9 });
  await appIcon(180).toFile(pub("apple-touch-icon.png"));
  await appIcon(192).toFile(pub("android-chrome-192x192.png"));
  await appIcon(512).toFile(pub("android-chrome-512x512.png"));
}

await ogImage();
await backgrounds();
await icons();
console.log("Images written to public/.");
