"use client";

import { useRef, useEffect } from "react";
import type { PlacedItem } from "@/lib/canvas-utils";
import { BOUQUET_LAYOUT } from "@/lib/canvas-utils";

interface BouquetCanvasCardProps {
  placedItems: PlacedItem[];
  baseUrl?: string;
  seed?: number;
  onRandomize?: () => void;
  onReset?: () => void;
  onDownload?: () => void;
}

export function BouquetCanvasCard({
  placedItems,
  baseUrl = "/assets",
  seed = Date.now(),
  onRandomize,
  onReset,
  onDownload,
}: BouquetCanvasCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || placedItems.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio ?? 1;
    const rect = container.getBoundingClientRect();
    const w = Math.floor(rect.width);
    const h = Math.floor(rect.height);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.scale(dpr, dpr);

    const TIE_X = BOUQUET_LAYOUT.TIE_POINT_X * w;
    const TIE_Y = BOUQUET_LAYOUT.TIE_POINT_Y * h;
    const size = Math.min(w, h);
    const baseSize = size * 0.28;

    ctx.clearRect(0, 0, w, h);

    const drawShadow = () => {
      ctx.save();
      ctx.fillStyle = "rgba(0,0,0,0.06)";
      ctx.beginPath();
      ctx.ellipse(w / 2, h * 0.88, w * 0.35, h * 0.04, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const HEAD_RATIO_FLOWER = 0.38;
    const HEAD_RATIO_PROP = 0.42;

    const drawStemsAndSticks = () => {
      ctx.save();
      placedItems.forEach((item, i) => {
        const px = item.x * w;
        const py = item.y * h;
        const stemStartY = py;
        const cpx = px + (TIE_X - px) * 0.5 + ((i % 3) - 1) * 12;
        const cpy = stemStartY + (TIE_Y - stemStartY) * 0.5;
        ctx.beginPath();
        ctx.moveTo(px, stemStartY);
        ctx.quadraticCurveTo(cpx, cpy, TIE_X, TIE_Y);
        if (item.type === "flower") {
          ctx.strokeStyle = "rgba(76, 175, 80, 0.55)";
        } else {
          ctx.strokeStyle = "rgba(139, 90, 43, 0.7)";
        }
        ctx.lineWidth = 3;
        ctx.stroke();
      });
      ctx.restore();
    };

    const getStemStickAngle = (item: PlacedItem, i: number) => {
      const px = item.x * w;
      const py = item.y * h;
      const cpx = px + (TIE_X - px) * 0.5 + ((i % 3) - 1) * 12;
      const cpy = py + (TIE_Y - py) * 0.5;
      return (Math.atan2(cpx - px, cpy - py) * 180) / Math.PI;
    };

    const loadAndDraw = async (item: PlacedItem, i: number) => {
      const folder = item.type === "flower" ? "flowers" : "props";
      const url = `${baseUrl}/${folder}/${item.src}`;
      const headRatio = item.type === "flower" ? HEAD_RATIO_FLOWER : HEAD_RATIO_PROP;
      const angle = getStemStickAngle(item, i);
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          ctx.save();
          const x = item.x * w;
          const y = item.y * h;
          ctx.translate(x, y);
          ctx.rotate((angle * Math.PI) / 180);
          const s = baseSize * item.scale;
          const headH = s * headRatio;
          ctx.drawImage(
            img,
            0, 0, img.naturalWidth, img.naturalHeight * headRatio,
            -s / 2, -headH, s, headH
          );
          ctx.restore();
          resolve();
        };
        img.onerror = () => resolve();
        img.src = url;
      });
    };

    (async () => {
      drawShadow();
      drawStemsAndSticks();
      for (let i = 0; i < placedItems.length; i++) {
        await loadAndDraw(placedItems[i], i);
      }
    })();
  }, [placedItems, baseUrl, seed]);

  return (
    <div className="rounded-2xl border-2 border-pink-200/50 bg-white/80 p-3 shadow-lg">
      <h3 className="mb-2 text-center text-sm font-semibold text-purple-800">
        Bouquet Preview
      </h3>
      <div
        ref={containerRef}
        className="relative mx-auto aspect-square max-h-[220px] w-full max-w-[220px] rounded-xl bg-gradient-to-b from-pink-50/80 to-purple-50/80 overflow-hidden"
      >
        {placedItems.length === 0 ? (
          <div className="flex h-full w-full items-center justify-center text-purple-400">
            Add flowers to see preview
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            className="absolute inset-0 h-full w-full"
          />
        )}
      </div>
      <div className="mt-2 flex flex-wrap justify-center gap-1.5">
        {onRandomize && (
          <button
            onClick={onRandomize}
            className="rounded-full bg-purple-200 px-2.5 py-1 text-xs text-purple-800 hover:bg-purple-300"
          >
            Randomize layout
          </button>
        )}
        {onReset && (
          <button
            onClick={onReset}
            className="rounded-full bg-pink-200 px-2.5 py-1 text-xs text-purple-800 hover:bg-pink-300"
          >
            Reset
          </button>
        )}
        {onDownload && (
          <button
            onClick={onDownload}
            className="rounded-full bg-gradient-to-r from-pink-400 to-purple-400 px-2.5 py-1 text-xs text-white hover:shadow-md"
          >
            Download
          </button>
        )}
      </div>
    </div>
  );
}
