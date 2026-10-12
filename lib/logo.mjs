// Geometry for the Dialogues MCP logo: a circle filled with diagonal stripes,
// drawn in a 100x100 box and clipped to the circle. Shared by the page header
// (components/logo-mark.tsx) and the icon files (scripts/prepare-images.mjs).

/** Stripes in the full mark. */
export const FINE_STRIPES = 12;
/** Fewer, wider stripes for small or low-density renders (favicons). */
export const COARSE_STRIPES = 7;

const ANGLE = 60; // degrees from horizontal, rising left to right
const FILL = 0.45; // stripe width as a share of the stripe spacing

/**
 * @param {number} count stripes across the circle
 * @returns {{ d: string, width: number }} path data and stroke width
 */
export function stripePath(count) {
  const radius = 50;
  const rad = (ANGLE * Math.PI) / 180;
  const along = [Math.cos(rad), -Math.sin(rad)];
  const across = [Math.sin(rad), Math.cos(rad)];
  const spacing = (2 * radius) / count;
  const reach = 60; // past the circle edge; the clip path trims the ends
  const round = (/** @type {number} */ n) => Math.round(n * 100) / 100;
  let d = "";
  for (let i = 0; i < count; i++) {
    const offset = -radius + spacing * (i + 0.5);
    const x = radius + offset * across[0];
    const y = radius + offset * across[1];
    d += `M${round(x - reach * along[0])} ${round(y - reach * along[1])}`;
    d += `L${round(x + reach * along[0])} ${round(y + reach * along[1])}`;
  }
  return { d, width: round(spacing * FILL) };
}
