import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Gemini API key not configured" },
      { status: 503 }
    );
  }

  let body: { message?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const message = typeof body.message === "string" ? body.message : "";

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `Rewrite this message into a sweet, heartwarming greeting. Keep it under 200 characters. Return only the rewritten message, nothing else.

Original message: ${message}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const trimmed = text.trim().slice(0, 200);
    return NextResponse.json({ message: trimmed });
  } catch (err) {
    console.error("Gemini enhance error:", err);
    return NextResponse.json(
      { error: "Failed to enhance message" },
      { status: 500 }
    );
  }
}
