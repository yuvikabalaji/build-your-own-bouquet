"use client";

import Image from "next/image";

interface AssetCardProps {
  src: string;
  label: string;
  quantity: number;
  onClick: () => void;
}

export function AssetCard({ src, label, quantity, onClick }: AssetCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col overflow-hidden rounded-2xl border-2 border-pink-200/50 bg-white/80 text-left shadow-sm transition-shadow hover:shadow-md hover:border-pink-300/70"
    >
      <div className="relative flex min-h-[80px] min-w-[80px] items-center justify-center p-2">
        <Image
          src={src}
          alt={label}
          width={80}
          height={80}
          className="object-contain"
          unoptimized
        />
        {quantity > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-6 min-w-6 items-center justify-center rounded-full bg-purple-500 px-1.5 text-xs font-bold text-white">
            {quantity}
          </span>
        )}
      </div>
      <div className="border-t border-pink-100 p-2">
        <span className="truncate text-sm font-medium text-purple-800">
          {label}
        </span>
      </div>
    </button>
  );
}
