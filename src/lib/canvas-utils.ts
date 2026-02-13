/**
 * Bouquet cluster layout: flowers in a tight dome, stems converging to tie point.
 * Layout constants (normalized 0-1):
 *   HEAD_CENTER = (0.5, 0.32)
 *   TIE_POINT = (0.5, 0.72)
 *   WRAP_BASE_Y = 0.86
 */

export interface BouquetItem {
  id: string;
  type: "flower" | "prop";
  src: string;
  quantity: number;
}

export interface PlacedItem {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  src: string;
  type: "flower" | "prop";
}

export const BOUQUET_LAYOUT = {
  HEAD_CENTER_X: 0.5,
  HEAD_CENTER_Y: 0.32,
  TIE_POINT_X: 0.5,
  TIE_POINT_Y: 0.72,
  WRAP_BASE_Y: 0.86,
  RADIUS_X: 0.22,
  RADIUS_Y: 0.16,
} as const;

function seededRandom(seed: number) {
  return function () {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

/**
 * Compute stem rotation so flower stem aims toward TIE_POINT.
 * Returns degrees for canvas.rotate (0 = stem down).
 */
function stemRotationTowardTie(flowerX: number, flowerY: number): number {
  const dx = BOUQUET_LAYOUT.TIE_POINT_X - flowerX;
  const dy = BOUQUET_LAYOUT.TIE_POINT_Y - flowerY;
  return (Math.atan2(dx, dy) * 180) / Math.PI;
}

/**
 * Generate bouquet layout: clustered flower heads, stems converge at tie point.
 * Accepts seed for deterministic randomization.
 */
export function computeBouquetLayout(
  items: BouquetItem[],
  seed?: number
): PlacedItem[] {
  const random = seed != null ? seededRandom(seed) : Math.random;
  const expanded: { src: string; type: "flower" | "prop" }[] = [];
  for (const item of items) {
    for (let i = 0; i < item.quantity; i++) {
      expanded.push({ src: item.src, type: item.type });
    }
  }
  const flowers = expanded.filter((e) => e.type === "flower");
  const props = expanded.filter((e) => e.type === "prop");
  const allHeads = [...flowers, ...props];

  const hcx = BOUQUET_LAYOUT.HEAD_CENTER_X;
  const hcy = BOUQUET_LAYOUT.HEAD_CENTER_Y;
  const rx = BOUQUET_LAYOUT.RADIUS_X;
  const ry = BOUQUET_LAYOUT.RADIUS_Y;
  const jitterPx = 8;

  const placed: PlacedItem[] = [];

  allHeads.forEach((item, i) => {
    const angle = random() * Math.PI * 2;
    const r = Math.sqrt(random());
    const jx = ((random() - 0.5) * 2 * jitterPx) / 400;
    const jy = ((random() - 0.5) * 2 * jitterPx) / 400;

    let x = hcx + r * rx * Math.cos(angle) + jx;
    let y = hcy + r * ry * Math.sin(angle) + jy;

    const isHero = i === 0 && item.type === "flower";
    const scale = isHero
      ? 1.2 + random() * 0.15
      : 0.85 + random() * 0.3;
    const rotDeg = stemRotationTowardTie(x, y);

    placed.push({
      x,
      y,
      scale: Math.min(scale, 1.35),
      rotation: rotDeg,
      src: item.src,
      type: item.type,
    });
  });

  placed.sort((a, b) => a.y - b.y);

  return placed;
}
