import * as z from "zod";

export const configSchema = z.object({
  status: z.enum(["online", "offline"]),
});

export const patchConfigSchema = configSchema.partial();

export type ConfigSchema = z.TypeOf<typeof configSchema>;
export type PatchConfigSchema = z.TypeOf<typeof patchConfigSchema>;