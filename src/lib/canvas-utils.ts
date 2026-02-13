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
  WRAP_TOP_Y: 0.44,
  WRAP_BASE_Y: 0.86,
  RADIUS_X: 0.22,
  RADIUS_Y: 0.16,
} as const;

/** Wrap paper: light pink. Ribbon: cream/yellow. */
export const BOUQUET_COLORS = {
  WRAP_FILL: "#fce4ec",
  RIBBON_FILL: "#fff9c4",
  RIBBON_BOW: "#fff59d",
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

/**
 * Draw wrap paper (tapered cone below flower cluster). Call after shadow, before stems.
 */
export function drawWrap(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const { WRAP_TOP_Y, WRAP_BASE_Y, TIE_POINT_X } = BOUQUET_LAYOUT;
  const { WRAP_FILL } = BOUQUET_COLORS;

  const wrapTopY = WRAP_TOP_Y * h;
  const wrapBaseY = WRAP_BASE_Y * h;
  const tieX = TIE_POINT_X * w;

  const topHalfW = w * 0.42;
  const baseHalfW = w * 0.08;
  const path = new Path2D();
  path.moveTo(tieX - topHalfW, wrapTopY);
  path.lineTo(tieX + topHalfW, wrapTopY);
  path.lineTo(tieX + baseHalfW, wrapBaseY);
  path.lineTo(tieX - baseHalfW, wrapBaseY);
  path.closePath();
  ctx.save();
  ctx.fillStyle = WRAP_FILL;
  ctx.fill(path);
  ctx.restore();
}

/**
 * Draw ribbon band and bow at tie point. Call after stems, before flower heads.
 */
export function drawRibbon(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const { TIE_POINT_X, TIE_POINT_Y } = BOUQUET_LAYOUT;
  const { RIBBON_FILL, RIBBON_BOW } = BOUQUET_COLORS;

  const tieX = TIE_POINT_X * w;
  const tieY = TIE_POINT_Y * h;

  const bandH = h * 0.04;
  const bandW = w * 0.5;
  ctx.save();
  ctx.fillStyle = RIBBON_FILL;
  ctx.fillRect(tieX - bandW / 2, tieY - bandH / 2, bandW, bandH);
  ctx.restore();

  const bowRadius = w * 0.08;
  const bowY = tieY - bandH * 0.5;
  ctx.save();
  ctx.fillStyle = RIBBON_BOW;
  ctx.beginPath();
  ctx.ellipse(tieX - bowRadius * 1.2, bowY, bowRadius, bowRadius * 1.2, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(tieX + bowRadius * 1.2, bowY, bowRadius, bowRadius * 1.2, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(tieX, bowY, bowRadius * 0.5, bowRadius * 0.8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** Draw wrap only (before stems). Call drawRibbon after stems, before flower heads. */
export function drawWrapAndRibbon(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number
): void {
  drawWrap(ctx, w, h);
}
