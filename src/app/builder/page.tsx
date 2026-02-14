"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs } from "@/components/Tabs";
import { SearchInput } from "@/components/SearchInput";
import { AssetCard } from "@/components/AssetCard";
import { SelectedTray, type SelectedItem } from "@/components/SelectedTray";
import { BouquetCanvasCard } from "@/components/BouquetCanvasCard";
import { SendForm } from "@/components/SendForm";
import { Toast } from "@/components/Toast";
import {
  computeBouquetLayout,
  type BouquetItem,
  type PlacedItem,
} from "@/lib/canvas-utils";
import { setLastSentBouquet } from "@/lib/last-bouquet-store";

interface Asset {
  filename: string;
  label: string;
}

const EXAMPLE_ITEMS: SelectedItem[] = [
  { id: "flower:rose.png", label: "Rose", type: "flower", quantity: 1 },
  { id: "flower:tulip.png", label: "Tulip", type: "flower", quantity: 1 },
  { id: "flower:sunflower.png", label: "Sunflower", type: "flower", quantity: 1 },
  { id: "prop:teddy-bear.png", label: "Teddy Bear", type: "prop", quantity: 1 },
];

function BuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const exampleApplied = useRef(false);
  const [activeTab, setActiveTab] = useState("flowers");
  const [search, setSearch] = useState("");
  const [flowers, setFlowers] = useState<Asset[]>([]);
  const [props, setProps] = useState<Asset[]>([]);
  const [assetsLoading, setAssetsLoading] = useState(true);
  const [selected, setSelected] = useState<SelectedItem[]>([]);
  const [layoutSeed, setLayoutSeed] = useState(Date.now());
  const [isSending, setIsSending] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    setAssetsLoading(true);
    fetch("/api/assets")
      .then((r) => r.json())
      .then((data: { flowers: Asset[]; props: Asset[] }) => {
        setFlowers(data.flowers ?? []);
        setProps(data.props ?? []);
      })
      .catch(() => setToast({ message: "Failed to load assets", type: "error" }))
      .finally(() => setAssetsLoading(false));
  }, []);

  useEffect(() => {
    if (exampleApplied.current) return;
    if (searchParams.get("example") !== "1") return;
    if (flowers.length === 0 && props.length === 0) return;
    exampleApplied.current = true;
    setSelected(EXAMPLE_ITEMS);
  }, [searchParams, flowers.length, props.length]);

  const assets = activeTab === "flowers" ? flowers : props;
  const type = activeTab === "flowers" ? "flower" : "prop";
  const filtered = assets.filter(
    (a) =>
      !search.trim() ||
      a.label.toLowerCase().includes(search.toLowerCase())
  );

  const addItem = useCallback((filename: string, label: string) => {
    const id = `${type}:${filename}`;
    setSelected((prev) => {
      const existing = prev.find((i) => i.id === id);
      if (existing) {
        return prev.map((i) =>
          i.id === id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { id, label, type, quantity: 1 }];
    });
  }, [type]);

  const increment = useCallback((id: string) => {
    setSelected((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, quantity: i.quantity + 1 } : i
      )
    );
  }, []);

  const decrement = useCallback((id: string) => {
    setSelected((prev) =>
      prev
        .map((i) =>
          i.id === id ? { ...i, quantity: i.quantity - 1 } : i
        )
        .filter((i) => i.quantity > 0)
    );
  }, []);

  const remove = useCallback((id: string) => {
    setSelected((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const bouquetItems: BouquetItem[] = selected.map((s) => {
    const [, src] = s.id.split(":");
    return { id: s.id, type: s.type, src, quantity: s.quantity };
  });

  const placedItems: PlacedItem[] = computeBouquetLayout(bouquetItems, layoutSeed);

  const handleRandomize = () => setLayoutSeed(Date.now());
  const handleReset = () => setSelected([]);

  const generateBouquetImage = useCallback((format: "png" | "jpeg" = "png"): Promise<string> => {
    const w = 400;
    const h = 400;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return Promise.reject(new Error("Canvas unavailable"));

    ctx.fillStyle = "#fff0fa";
    ctx.fillRect(0, 0, w, h);

    const TIE_X = w * 0.5;
    const TIE_Y = h * 0.72;
    const baseSize = Math.min(w, h) * 0.28;
    const HEAD_RATIO_FLOWER = 0.38;
    const HEAD_RATIO_PROP = 0.42;

    const drawShadow = () => {
      ctx.fillStyle = "rgba(0,0,0,0.06)";
      ctx.beginPath();
      ctx.ellipse(w / 2, h * 0.88, w * 0.35, h * 0.04, 0, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawStemsAndSticks = () => {
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
    };

    const getStemStickAngle = (item: PlacedItem, i: number) => {
      const px = item.x * w;
      const py = item.y * h;
      const cpx = px + (TIE_X - px) * 0.5 + ((i % 3) - 1) * 12;
      const cpy = py + (TIE_Y - py) * 0.5;
      return (Math.atan2(cpx - px, cpy - py) * 180) / Math.PI;
    };

    const draw = (item: PlacedItem, i: number) =>
      new Promise<void>((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        const headRatio = item.type === "flower" ? HEAD_RATIO_FLOWER : HEAD_RATIO_PROP;
        const angle = getStemStickAngle(item, i);
        img.onload = () => {
          ctx.save();
          ctx.translate(item.x * w, item.y * h);
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
        img.src = `/assets/${item.type === "flower" ? "flowers" : "props"}/${item.src}`;
      });

    return (async () => {
      drawShadow();
      drawStemsAndSticks();
      for (let i = 0; i < placedItems.length; i++) await draw(placedItems[i], i);
      return canvas.toDataURL(format === "jpeg" ? "image/jpeg" : "image/png", format === "jpeg" ? 0.85 : undefined);
    })();
  }, [placedItems]);

  const handleDownload = useCallback(() => {
    if (placedItems.length === 0) return;
    generateBouquetImage().then((dataUrl) => {
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "bouquet.png";
      a.click();
    });
  }, [placedItems, generateBouquetImage]);

  const handleEnhance = async (message: string): Promise<string> => {
    const res = await fetch("/api/enhance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    if (!res.ok) throw new Error("Enhance failed");
    const data = await res.json();
    return data.message ?? message;
  };

  const handleSubmit = async (data: {
    receiverEmail: string;
    senderName: string;
    message: string;
  }) => {
    if (placedItems.length === 0) {
      setToast({ message: "Add at least one flower or prop", type: "error" });
      return;
    }
    setIsSending(true);
    try {
      const imageData = await generateBouquetImage("jpeg");
      const res = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverEmail: data.receiverEmail,
          senderName: data.senderName,
          message: data.message,
          imageData,
        }),
      });
      const text = await res.text();
      let json: { error?: string; filename?: string };
      try {
        json = text ? JSON.parse(text) : {};
      } catch {
        const preview = text.slice(0, 200);
        throw new Error(
          preview.includes("<!DOCTYPE") || preview.includes("<html")
            ? "Server returned an error page. The image may be too large—try fewer flowers."
            : "Invalid response from server. Please try again."
        );
      }
      if (!res.ok) {
        throw new Error(json.error ?? "Send failed");
      }
      if (typeof window !== "undefined" && imageData) {
        setLastSentBouquet(imageData);
        try {
          sessionStorage.setItem("byob-sent-bouquet", imageData);
        } catch {
          /* sessionStorage full or unavailable; in-memory store still has it */
        }
      }
      router.push(json.filename ? `/success?file=${json.filename}` : "/success");
    } catch (err) {
      setToast({
        message: err instanceof Error ? err.message : "Send failed",
        type: "error",
      });
    } finally {
      setIsSending(false);
    }
  };

  const getQuantity = (filename: string) => {
    const id = `${type}:${filename}`;
    return selected.find((i) => i.id === id)?.quantity ?? 0;
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 py-6">
      <h1 className="text-2xl font-bold text-purple-900 md:text-3xl">
        Bouquet Builder
      </h1>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 rounded-3xl border-2 border-pink-200/50 bg-white/60 p-4">
          <Tabs
            tabs={[
              { id: "flowers", label: "Flowers" },
              { id: "props", label: "Props" },
            ]}
            activeId={activeTab}
            onChange={setActiveTab}
          />
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="grid min-h-[120px] grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-3">
            {assetsLoading ? (
              <p className="col-span-full py-8 text-center text-purple-500">
                Loading flowers and props...
              </p>
            ) : filtered.length === 0 ? (
              <p className="col-span-full py-8 text-center text-purple-500">
                {search.trim()
                  ? `No ${type}s match your search.`
                  : `No ${type}s found.`}
              </p>
            ) : (
              filtered.map((a) => (
                <AssetCard
                  key={`${type}-${a.filename}`}
                  src={`/assets/${activeTab === "flowers" ? "flowers" : "props"}/${a.filename}`}
                  label={a.label}
                  quantity={getQuantity(a.filename)}
                  onClick={() => addItem(a.filename, a.label)}
                />
              ))
            )}
          </div>
          <SelectedTray
            items={selected}
            onIncrement={increment}
            onDecrement={decrement}
            onRemove={remove}
          />
        </div>

        <div className="flex items-start justify-center">
          <BouquetCanvasCard
            placedItems={placedItems}
            seed={layoutSeed}
            onRandomize={handleRandomize}
            onReset={handleReset}
            onDownload={handleDownload}
          />
        </div>

        <div className="rounded-3xl border-2 border-pink-200/50 bg-white/60 p-4">
          <h2 className="mb-4 font-semibold text-purple-800">Send Bouquet</h2>
          <SendForm
            onSubmit={handleSubmit}
            onEnhance={handleEnhance}
            isLoading={isSending}
          />
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default function BuilderPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-purple-600">Loading...</div>}>
      <BuilderContent />
    </Suspense>
  );
}
