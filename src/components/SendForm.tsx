"use client";

import { useState } from "react";
import { CandyButton } from "./CandyButton";

interface SendFormProps {
  onSubmit: (data: {
    receiverEmail: string;
    senderName: string;
    message: string;
  }) => void;
  onEnhance?: (message: string) => Promise<string>;
  isLoading?: boolean;
}

export function SendForm({ onSubmit, onEnhance, isLoading }: SendFormProps) {
  const [receiverEmail, setReceiverEmail] = useState("");
  const [senderName, setSenderName] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (!receiverEmail.trim()) err.receiverEmail = "Email is required";
    else if (!emailRegex.test(receiverEmail))
      err.receiverEmail = "Invalid email format (abc@xyz.com)";
    if (message.length > 200) err.message = "Message must be 200 characters or less";
    setErrors(err);
    if (Object.keys(err).length > 0) return;
    onSubmit({ receiverEmail: receiverEmail.trim(), senderName: senderName.trim(), message });
  };

  const handleEnhance = async () => {
    if (!onEnhance) return;
    try {
      const enhanced = await onEnhance(message);
      setMessage(enhanced);
    } catch {
      setErrors((e) => ({ ...e, message: "Enhance failed. Try again." }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-purple-700">
          Receiver email *
        </label>
        <input
          type="email"
          value={receiverEmail}
          onChange={(e) => setReceiverEmail(e.target.value)}
          placeholder="abc@xyz.com"
          className={`mt-1 w-full rounded-xl border-2 bg-white/80 px-4 py-2 text-purple-800 placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-300 ${
            errors.receiverEmail ? "border-red-300" : "border-pink-200/60"
          }`}
        />
        {errors.receiverEmail && (
          <p className="mt-1 text-xs text-red-500">{errors.receiverEmail}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-purple-700">
          Your name (optional)
        </label>
        <input
          type="text"
          value={senderName}
          onChange={(e) => setSenderName(e.target.value)}
          placeholder="From..."
          className="mt-1 w-full rounded-xl border-2 border-pink-200/60 bg-white/80 px-4 py-2 text-purple-800 placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-300"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-purple-700">
          Message (max 200 chars)
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write a sweet note..."
          rows={3}
          maxLength={200}
          className={`mt-1 w-full rounded-xl border-2 bg-white/80 px-4 py-2 text-purple-800 placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-300 ${
            errors.message ? "border-red-300" : "border-pink-200/60"
          }`}
        />
        <div className="mt-1 flex items-center justify-between">
          <span className="text-xs text-purple-500">{message.length}/200</span>
          {onEnhance && (
            <button
              type="button"
              onClick={handleEnhance}
              className="text-xs text-purple-600 hover:text-purple-700"
            >
              Enhance with Gemini
            </button>
          )}
        </div>
        {errors.message && (
          <p className="mt-1 text-xs text-red-500">{errors.message}</p>
        )}
      </div>
      <div className="flex gap-2">
        <CandyButton type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? "Sending..." : "Send Bouquet"}
        </CandyButton>
      </div>
    </form>
  );
}
