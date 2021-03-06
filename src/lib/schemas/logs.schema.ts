import { z } from "zod";

export const logSchema = z
  .object({
    type: z.string(),
    message: z.string(),
    data: z.string(),
    stackTrace: z.string(),
    device: z.string(),
    timestamp: z.number(),
    timestring: z.string(),
    href: z.string(),
  })
  .strict();

export const postLogSchema = logSchema;

// Type extractions
export type LogSchema = z.TypeOf<typeof logSchema>;
export type PostLogSchema = z.TypeOf<typeof postLogSchema>;
