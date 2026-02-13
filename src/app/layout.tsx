import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { GradientBackground } from "@/components/GradientBackground";

export const metadata: Metadata = {
  title: "Build Your Own Bouquet",
  description: "Create and send a virtual bouquet",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <GradientBackground>
          <Navbar />
          <main className="px-4 pb-12 md:px-6">{children}</main>
        </GradientBackground>
      </body>
    </html>
  );
}
