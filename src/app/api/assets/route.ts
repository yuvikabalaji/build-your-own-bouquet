import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

function filenameToLabel(filename: string): string {
  const name = filename.replace(/\.(png|jpg|jpeg|webp)$/i, "");
  return name
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export async function GET() {
  const base = path.join(process.cwd(), "public", "assets");
  const flowersDir = path.join(base, "flowers");
  const propsDir = path.join(base, "props");

  const readDir = (dir: string): { filename: string; label: string }[] => {
    if (!fs.existsSync(dir)) return [];
    return fs
      .readdirSync(dir)
      .filter((f) => /\.(png|jpg|jpeg|webp)$/i.test(f))
      .map((filename) => ({ filename, label: filenameToLabel(filename) }))
      .sort((a, b) => a.label.localeCompare(b.label));
  };

  const flowers = readDir(flowersDir);
  const props = readDir(propsDir);

  return NextResponse.json({ flowers, props });
}
