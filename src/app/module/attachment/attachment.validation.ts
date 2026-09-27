import { z } from "zod";

export const createAttachmentSchema = z.object({
  body: z.object({
    originalName: z.string(),
    fileName: z.string(),
    mimeType: z.string(),
    size: z.number().int().positive(),
    url: z.string().url(),
    storageKey: z.string(),
  }),
});
