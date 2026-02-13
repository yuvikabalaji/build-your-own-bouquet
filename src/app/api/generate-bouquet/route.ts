import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";

const generateBouquetSchema = z.object({
  items: z.array(
    z.object({
      label: z.string(),
      type: z.enum(["flower", "prop"]),
      quantity: z.number().int().min(1),
    })
  ),
});

function buildPrompt(items: { label: string; type: string; quantity: number }[]): string {
  const flowerParts = items
    .filter((i) => i.type === "flower")
    .map((i) => `${i.quantity} ${i.label}${i.quantity > 1 ? "s" : ""}`)
    .join(", ");
  const propParts = items
    .filter((i) => i.type === "prop")
    .map((i) => `${i.quantity} ${i.label}${i.quantity > 1 ? "s" : ""}`)
    .join(", ");

  const flowerDesc = flowerParts || "no flowers";
  const propDesc = propParts ? ` with ${propParts}` : "";

  return `Generate a single high-quality photorealistic image of a beautiful floral bouquet. The bouquet must contain: ${flowerDesc}${propDesc}. Style: elegant gift bouquet, tightly arranged cluster of blooms at the top, stems converging below, wrapped in soft light pink paper with a cream/yellow ribbon and bow. Pastel kawaii aesthetic, professional product photography, soft lighting, clean background. Output a single square image (1:1 aspect ratio) of the complete bouquet.`;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rate = checkRateLimit(ip);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: `Rate limit exceeded. Try again in ${rate.retryAfter ?? 3600} seconds.` },
      { status: 429 }
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Gemini API key not configured" },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = generateBouquetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { items } = parsed.data;
  if (items.length === 0) {
    return NextResponse.json(
      { error: "At least one flower or prop is required" },
      { status: 400 }
    );
  }

  const prompt = buildPrompt(items);
  const modelId = "gemini-2.0-flash-preview-image-generation";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      responseModalities: ["TEXT", "IMAGE"],
      responseMimeType: "text/plain",
    } as Record<string, unknown>,
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    const data = (await res.json()) as Record<string, unknown>;

    if (!res.ok) {
      const err = data?.error as { message?: string } | undefined;
      const msg = err?.message ?? "Gemini API error";
      console.error("Gemini generate-bouquet error:", msg);
      return NextResponse.json(
        { error: msg },
        { status: res.status >= 500 ? 502 : 400 }
      );
    }

    const candidates = data?.candidates as Array<{ content?: { parts?: Array<{ inlineData?: { mimeType?: string; data?: string } }> } }> | undefined;
    const firstCandidate = candidates?.[0];
    const parts = (firstCandidate?.content?.parts ?? []) as Array<{ inlineData?: { mimeType?: string; data?: string } }>;
    const imagePart = parts.find((p) => p.inlineData?.data);
    if (!imagePart?.inlineData?.data) {
      return NextResponse.json(
        { error: "No image was generated" },
        { status: 502 }
      );
    }

    const mime = imagePart.inlineData.mimeType ?? "image/png";
    const base64 = imagePart.inlineData.data;
    const dataUrl = `data:${mime};base64,${base64}`;

    return NextResponse.json({ imageData: dataUrl });
  } catch (err) {
    console.error("Generate bouquet error:", err);
    return NextResponse.json(
      { error: "Failed to generate bouquet image" },
      { status: 500 }
    );
  }
}
