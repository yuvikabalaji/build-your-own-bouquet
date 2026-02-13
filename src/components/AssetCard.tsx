"use client";

import Image from "next/image";

interface AssetCardProps {
  src: string;
  label: string;
  onAdd: () => void;
  disabled?: boolean;
}

export function AssetCard({ src, label, onAdd, disabled }: AssetCardProps) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border-2 border-pink-200/50 bg-white/80 shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-square p-2">
        <Image
          src={src}
          alt={label}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 50vw, 150px"
        />
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-pink-100 p-2">
        <span className="truncate text-sm font-medium text-purple-800">
          {label}
        </span>
        <button
          onClick={onAdd}
          disabled={disabled}
          className="rounded-full bg-pink-300 px-3 py-1 text-xs font-medium text-white hover:bg-pink-400 disabled:opacity-50"
        >
          Add
        </button>
      </div>
    </div>
  );
}
