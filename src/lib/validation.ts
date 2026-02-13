import { z } from "zod";

export const sendBouquetSchema = z.object({
  receiverEmail: z
    .string()
    .email("Invalid email format")
    .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Must be valid abc@xyz.com format"),
  senderName: z.string().max(100).optional().or(z.literal("")),
  message: z.string().max(200, "Message must be 200 characters or less").optional().default(""),
  imageData: z.string().refine((s) => s.startsWith("data:image/png;base64,"), "Invalid image data"),
});

export type SendBouquetInput = z.infer<typeof sendBouquetSchema>;
