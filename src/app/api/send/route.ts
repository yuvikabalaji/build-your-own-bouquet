import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import path from "path";
import fs from "fs";
import { sendBouquetSchema } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rate-limit";

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1"
  );
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rate = checkRateLimit(ip);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again later." },
      {
        status: 429,
        headers: rate.retryAfter
          ? { "Retry-After": String(rate.retryAfter) }
          : undefined,
      }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const parsed = sendBouquetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Validation failed" },
      { status: 400 }
    );
  }

  const { receiverEmail, senderName, message, imageData } = parsed.data;

  const base64Data = imageData.replace(/^data:image\/png;base64,/, "");
  const buf = Buffer.from(base64Data, "base64");

  const generatedDir = path.join(process.cwd(), "public", "generated");
  if (!fs.existsSync(generatedDir)) fs.mkdirSync(generatedDir, { recursive: true });

  const filename = `bouquet-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.png`;
  const outPath = path.join(generatedDir, filename);
  fs.writeFileSync(outPath, buf);

  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (emailUser && emailPass) {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: { user: emailUser, pass: emailPass },
    });

    const fromLabel = senderName ? `${senderName} <${emailUser}>` : emailUser;
    await transporter.sendMail({
      from: fromLabel,
      to: receiverEmail,
      subject: "You received a virtual bouquet!",
      text: message || "Someone sent you a bouquet from Build Your Own Bouquet!",
      attachments: [{ filename, content: buf }],
    });
  }

  return NextResponse.json({
    success: true,
    filename,
  });
}
