import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <section className="mx-auto max-w-6xl py-8 md:py-16">
      <div className="grid gap-8 md:grid-cols-2 md:items-center">
        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-purple-900 md:text-5xl">
            Build Your Own Bouquet
          </h1>
          <p className="text-lg text-purple-700">
            Pick your favorite flowers and props, arrange them on a canvas, and
            send a personalized bouquet to someone special.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/builder"
              className="rounded-full bg-gradient-to-r from-pink-400 to-purple-400 px-6 py-3 font-medium text-white shadow-md hover:scale-[1.02] transition-transform"
            >
              Start Building
            </Link>
            <Link
              href="/builder?example=1"
              className="rounded-full border-2 border-purple-300 bg-white/80 px-6 py-3 font-medium text-purple-700 hover:bg-pink-50 transition-colors"
            >
              See Example
            </Link>
          </div>
        </div>
        <div className="flex justify-center">
          <div className="aspect-square w-full max-w-sm overflow-hidden rounded-3xl border-2 border-pink-200/50 bg-white/60 shadow-lg">
            <Image
              src="/byob-logo.png"
              alt="Build Your Own Bouquet"
              width={400}
              height={400}
              className="h-full w-full object-contain"
            />
          </div>
        </div>
      </div>
      <footer className="mt-16 border-t border-pink-200/50 pt-6 text-center text-sm text-purple-600">
        <Link href="/" className="hover:underline">Build Your Own Bouquet</Link>
      </footer>
    </section>
  );
}
