"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary";

interface CandyButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

export function CandyButton({
  variant = "primary",
  children,
  className = "",
  ...props
}: CandyButtonProps) {
  const base =
    "rounded-full px-4 py-2 text-sm font-medium transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100";
  const styles: Record<Variant, string> = {
    primary:
      "bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-md hover:shadow-lg",
    secondary:
      "bg-white/80 border-2 border-pink-200 text-purple-700 hover:bg-pink-50",
  };
  return (
    <button
      className={`${base} ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
