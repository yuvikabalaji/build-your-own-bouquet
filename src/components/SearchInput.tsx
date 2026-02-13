"use client";

import { InputHTMLAttributes } from "react";

interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {}

export function SearchInput({ className = "", ...props }: SearchInputProps) {
  return (
    <input
      type="search"
      placeholder="Search..."
      className={`w-full rounded-xl border-2 border-pink-200/60 bg-white/80 px-4 py-2 text-purple-800 placeholder-purple-300 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-300/50 ${className}`}
      {...props}
    />
  );
}
