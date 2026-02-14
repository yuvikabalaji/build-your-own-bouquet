"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CandyButton } from "@/components/CandyButton";
import { takeLastSentBouquet } from "@/lib/last-bouquet-store";

function SuccessContent() {
  const searchParams = useSearchParams();
  const file = searchParams.get("file");
  const [imageData, setImageData] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("byob-sent-bouquet");
      if (stored) {
        setImageData(stored);
        sessionStorage.removeItem("byob-sent-bouquet");
        return;
      }
    } catch {
      /* ignore */
    }
    const inMemory = takeLastSentBouquet();
    if (inMemory) setImageData(inMemory);
  }, []);

  const fileUrl = file && file !== "null" ? `/generated/${file}` : null;
  const imageSrc = imageData || fileUrl;

  return (
    <div className="mx-auto max-w-2xl space-y-8 py-12 text-center">
      <div className="rounded-3xl border-2 border-green-200/70 bg-green-50/80 px-6 py-4">
        <h1 className="text-2xl font-bold text-green-800">Bouquet Sent!</h1>
      </div>

      <div className="overflow-hidden rounded-3xl border-2 border-pink-200/50 bg-white/80 shadow-lg">
        {imageSrc ? (
          <div className="aspect-square max-h-[400px] w-full bg-gradient-to-b from-pink-50/80 to-purple-50/80 p-4">
            <img
              src={imageSrc}
              alt="Your bouquet"
              className="mx-auto h-full w-full object-contain"
            />
          </div>
        ) : (
          <div className="aspect-square flex items-center justify-center text-purple-400">
            Bouquet preview
          </div>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        <Link href="/builder">
          <CandyButton variant="primary">Send Another</CandyButton>
        </Link>
        {imageSrc && (
          <a href={imageSrc} download="bouquet.jpg">
            <CandyButton variant="secondary">Download</CandyButton>
          </a>
        )}
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-purple-600">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
