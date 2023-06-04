import { z } from "zod";

export const controlSchema = z.object({
  id: z.string(),
  code: z.string(),
  lat: z.number(),
  lon: z.number(),
});

export type Control = z.infer<typeof controlSchema>;
