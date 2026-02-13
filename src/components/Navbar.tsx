"use client";

import Link from "next/link";

export function Navbar() {
  return (
    <nav className="flex items-center justify-center px-4 py-3 md:px-6 md:py-4">
      <Link
        href="/"
        className="text-lg font-bold text-purple-800 md:text-xl hover:text-purple-600 transition-colors"
      >
        Build Your Own Bouquet
      </Link>
    </nav>
  );
}
