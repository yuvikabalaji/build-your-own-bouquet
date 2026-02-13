"use client";

import { ReactNode } from "react";

export function GradientBackground({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-amber-100">
      {children}
    </div>
  );
}
