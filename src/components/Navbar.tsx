"use client";

import Link from "next/link";

export function Navbar() {
  return (
    <nav className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4">
      <Link
        href="/"
        className="text-lg font-bold text-purple-800 md:text-xl hover:text-purple-600 transition-colors"
      >
        Build Your Own Bouquet
      </Link>
      <Link
        href="/builder"
        className="rounded-full bg-gradient-to-r from-pink-400 to-purple-400 px-4 py-2 text-sm font-medium text-white shadow-md hover:scale-[1.02] transition-transform hover:shadow-lg"
      >
        Start Building
      </Link>
    </nav>
  );
}
